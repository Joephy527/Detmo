import csv
import logging
from io import StringIO
from typing import List, Optional
from datetime import datetime

import pandas as pd
import razorpay
from clerk import *
from fastapi import (APIRouter, Depends, FastAPI, File, HTTPException, Request,
                     UploadFile)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import (get_redoc_html, get_swagger_ui_html,
                                  get_swagger_ui_oauth2_redirect_html)
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session, joinedload, sessionmaker

from clerk_client import clerk_client
from database import *
from models import *
from razor import razorpay_client
from rbac import (ADMIN_ROLE_ID, get_current_active_admin,
                  get_current_active_user, get_current_user)
from schema import *

app = FastAPI(
    title="DETMO API",
    description="This is a API with meaningful endpoint descriptions",
    docs_url=None,
    redoc_url=None,
)
security = HTTPBearer()


router = APIRouter()


@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=app.title + " - Swagger UI",
        oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url,
        swagger_js_url="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js",
        swagger_css_url="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css",
    )


@app.get(app.swagger_ui_oauth2_redirect_url, include_in_schema=False)
async def swagger_ui_redirect():
    return get_swagger_ui_oauth2_redirect_html()


@app.get("/redoc", include_in_schema=False)
async def redoc_html():
    return get_redoc_html(
        openapi_url=app.openapi_url,
        title=app.title + " - ReDoc",
        redoc_js_url="https://unpkg.com/redoc@next/bundles/redoc.standalone.js",
    )


origins = [
    "http://localhost:3000",
    "https://detmobackend.onrender.com",
    "https://detmo-chi.vercel.app",
    "https://www.detmo.in",
    "https://www.detmo.co",
    # Add other origins if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Base.metadata.create_all(bind=engine)


# Create a session
DBSession = sessionmaker(bind=engine)
session = DBSession()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/", tags=["Detmo"])
async def protected_route():
    return {
        "message": "Detmo Backend Running !",
    }


# @app.get("/api/admin")
# async def admin_route(admin: dict = Depends(get_current_active_admin)):
#     return {"message": "Hello, Admin!", "admin": admin}

# @app.get("/api/user")
# async def user_route(user: dict = Depends(get_current_active_user)):
#     return {"message": "Hello, User!", "user": user}


# api for users

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# def hash_password(password: str) -> str:
#     return pwd_context.hash(password)


def get_email_domain(email: str) -> str:
    return email.split("@")[1]


def get_company_by_email_domain(db: Session, domain: str):
    users_with_same_domain = (
        db.query(UserDetails).filter(UserDetails.Email.like(f"%@{domain}")).all()
    )
    if users_with_same_domain:
        return users_with_same_domain[0].CompanyDetailsID
    return None


def get_default_role(db: Session):
    role = db.query(RoleDetails).filter(RoleDetails.UserRole == "user").first()
    if not role:
        role = RoleDetails(UserRole="user")
        db.add(role)
        db.commit()
        db.refresh(role)
    return role


def get_default_currency(db: Session):
    currency = (
        db.query(CurrencyDetails).filter(CurrencyDetails.Currency == "USD").first()
    )
    if not currency:
        currency = CurrencyDetails(Currency="USD")
        db.add(currency)
        db.commit()
        db.refresh(currency)
    return currency


def ensure_company_user_relation(
    db: Session, user_id: str, company_id: str, default_role_name: str = "user"
) -> CompanyUser:
    """
    Ensures a CompanyUser relation exists for the given user and company.
    If not, creates one with the given default role.

    Returns the CompanyUser instance.
    """
    company_user = (
        db.query(CompanyUser)
        .filter(CompanyUser.UserID == user_id, CompanyUser.CompanyID == company_id)
        .first()
    )

    if company_user:
        return company_user

    # Find or create default role
    role = (
        db.query(RoleDetails).filter(RoleDetails.UserRole == default_role_name).first()
    )
    if not role:
        role = RoleDetails(UserRole=default_role_name)
        db.add(role)
        db.commit()
        db.refresh(role)
        logger.info(f"Created default role '{default_role_name}' with ID {role.RoleID}")

    # Create CompanyUser relationship
    company_user = CompanyUser(
        UserID=user_id,
        CompanyID=company_id,
        RoleID=role.RoleID,
    )
    db.add(company_user)
    db.commit()
    db.refresh(company_user)

    return company_user


def sync_clerk_user_metadata(user: UserDetails, company_user: CompanyUser):
    """
    Syncs the Clerk user's metadata with the role + paid status.
    Format: "<role>_<paid|unpaid>" in public_metadata["role"].
    """
    role_name = company_user.Role.UserRole if company_user.Role else "user"
    full_role = f"{role_name}_paid" if user.IsPaid else role_name

    clerk_user = clerk_client.users.get(user_id=user.ClerkID)
    current_metadata = clerk_user.public_metadata or {}

    if current_metadata.get("role") != full_role:
        clerk_client.users.update_metadata(
            user_id=user.ClerkID,
            public_metadata={
                **current_metadata,
                "role": full_role,
            },
        )
        logger.info(
            f"Updated Clerk metadata: role='{full_role}' for user={user.ClerkID}"
        )
    else:
        logger.info(f"Clerk metadata already up-to-date for user={user.ClerkID}")


@app.post("/webhooks/clerk", tags=["Webhooks"])
async def handle_clerk_webhook(request: Request, db: Session = Depends(get_db)):
    try:
        raw_body = await request.body()
        logger.debug(f"Received raw webhook body: {raw_body}")

        payload = await request.json()
        logger.debug(f"Received webhook payload: {payload}")

        event_type = payload.get("type")
        data = payload.get("data")
        use_existing_company = payload.get("use_existing_company", False)

        clerk_id = None
        if event_type in ["user.created", "user.updated"]:
            clerk_id = data["id"]
        elif event_type == "session.created":
            clerk_id = data["user_id"]

        # Event-specific handlers
        if event_type == "user.created":
            await create_user(db, data, use_existing_company)

        elif event_type == "user.updated":
            await update_user(db, data)

        elif event_type == "user.deleted":
            await delete_user(db, data["id"])

        # Only run metadata sync if we have a Clerk user ID
        if clerk_id:
            user = db.query(UserDetails).filter(UserDetails.ClerkID == clerk_id).first()

            if user and user.CompanyDetailsID:
                # Use the internal DB user ID
                company_user = ensure_company_user_relation(
                    db=db, user_id=user.ClerkID, company_id=user.CompanyDetailsID
                )

                sync_clerk_user_metadata(user=user, company_user=company_user)

        return {"message": "Webhook received"}

    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


async def create_user(db: Session, user_data: dict, use_existing_company: bool):
    try:
        logger.debug(f"Creating user with data: {user_data}")

        # Check if user already exists
        existing_user = db.query(UserDetails).filter_by(ClerkID=user_data["id"]).first()
        if existing_user:
            logger.info(f"User already exists: {existing_user}")
            return existing_user

        email_domain = get_email_domain(
            user_data["email_addresses"][0]["email_address"]
        )
        logger.debug(f"Extracted email domain: {email_domain}")

        default_currency = get_default_currency(db)
        new_company = CompanyDetailsInfo(
            DisplayName="New Company for "
            + user_data["first_name"]
            + " "
            + user_data.get("last_name", ""),
            PhoneNumber="1234567890",
            Email=user_data["first_name"]
            + "_"
            + user_data.get("last_name", "")
            + "@"
            + email_domain,
            LegalName="New Company LLC",
            RegistrationNumber="123456789",
            VatNumber="VAT123456",
            Address="123 New Street",
            City="New City",
            Country="New Country",
            Zip="12345",
            CurrencyID=default_currency.CurrencyID,
        )
        db.add(new_company)
        db.commit()
        db.refresh(new_company)
        company_id = new_company.CompanyDetailsID
        logger.debug(f"Created new company with ID: {company_id}")

        role = db.query(RoleDetails).filter(RoleDetails.UserRole == "admin").first()
        if not role:
            role = RoleDetails(UserRole="admin")
            db.add(role)
            db.commit()
            db.refresh(role)

        db_user = UserDetails(
            ClerkID=user_data["id"],
            UserName=user_data["first_name"] + " " + user_data.get("last_name", ""),
            Email=user_data["email_addresses"][0]["email_address"],
            Password="default password",  # Handle password setting as per your requirements
            RoleID=role.RoleID,
            CompanyDetailsID=company_id,
            DefaultCompanyDetailsID=company_id,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        logger.info(f"User created: {db_user}")  # Log the created user for debugging

        company_user = CompanyUser(
            UserID=db_user.ClerkID,
            CompanyID=company_id,
            RoleID=role.RoleID,
        )
        db.add(company_user)
        db.commit()
        logger.info(f"Created CompanyUser link for admin: {company_user}")

        return db_user
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating user: {e}")
        raise


async def update_user(db: Session, user_data: dict):
    try:
        db_user = (
            db.query(UserDetails).filter(UserDetails.ClerkID == user_data["id"]).first()
        )
        if db_user:
            db_user.UserName = (
                user_data["first_name"] + " " + user_data.get("last_name", "")
            )
            db_user.Email = user_data["email_addresses"][0]["email_address"]
            db.commit()
            db.refresh(db_user)
            logger.info(
                f"User updated: {db_user}"
            )  # Log the updated user for debugging
            return db_user
    except Exception as e:
        logger.error(f"Error updating user: {e}")
        raise


async def delete_user(db: Session, user_id: str):
    try:
        db_user = db.query(UserDetails).filter(UserDetails.ClerkID == user_id).first()
        if db_user:
            db.delete(db_user)
            db.commit()
            logger.info(
                f"User deleted: {db_user}"
            )  # Log the deleted user for debugging
    except Exception as e:
        logger.error(f"Error deleting user: {e}")
        raise


# pagination
def paginate(query, skip: int = 0, limit: int = 10):
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return PaginatedResponse(total=total, items=items)


@app.get(
    "/v1/company/{company_id}/users",
    response_model=UserListResponse,
    tags=["company_users"],
)
async def get_company_users(
    company_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_user),
):
    db_company = (
        db.query(CompanyDetailsInfo)
        .filter(CompanyDetailsInfo.CompanyDetailsID == company_id)
        .first()
    )

    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")

    company_user = ensure_company_user_relation(
        db, user_id=current_user.ClerkID, company_id=company_id
    )
    if company_user.RoleID != ADMIN_ROLE_ID:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    company_users = (
        db.query(CompanyUser)
        .options(
            joinedload(CompanyUser.User),
            joinedload(CompanyUser.Role),
        )
        .filter(CompanyUser.CompanyID == company_id)
        .all()
    )

    if not company_users:
        raise HTTPException(status_code=404, detail="No users found for this company")

    return {
        "items": [
            {
                "ClerkID": cu.UserID,
                "UserName": cu.User.UserName,
                "Email": cu.User.Email,
                "Role": cu.Role.UserRole,
                "RoleID": cu.RoleID,
            }
            for cu in company_users
        ]
    }


@app.get("/v1/users", response_model=PaginatedResponse[UserResponse], tags=["Users"])
async def get_users(
    user_id: Optional[str] = None,
    company_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_active_user),
):
    if skip < 0:
        raise HTTPException(
            status_code=400, detail="skip parameter must be greater than or equal to 0"
        )
    if limit < 1 or limit > 100:
        raise HTTPException(
            status_code=400, detail="limit parameter must be between 1 and 100"
        )

    query = db.query(UserDetails).options(joinedload(UserDetails.Role))

    if user_id:
        user = query.filter(UserDetails.ClerkID == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return PaginatedResponse(total=1, items=[UserResponse.from_orm(user)])
    elif company_id:
        query = query.filter(UserDetails.CompanyDetailsID == company_id)

    paginated_result = paginate(query, skip, limit)
    paginated_result.items = [
        UserResponse.from_orm(user) for user in paginated_result.items
    ]
    return paginated_result


def get_company_user_relation(
    db: Session, user_id: str, company_id: str, role_name: str = "user"
) -> CompanyUser:
    try:
        # Step 1: Find or create the role
        role = db.query(RoleDetails).filter_by(UserRole=role_name).first()
        if not role:
            role = RoleDetails(UserRole=role_name)
            db.add(role)
            db.commit()
            db.refresh(role)
            logger.info(f"Created role '{role_name}' with ID {role.RoleID}")

        # Step 2: Find existing CompanyUser
        company_user = (
            db.query(CompanyUser)
            .filter(CompanyUser.UserID == user_id, CompanyUser.CompanyID == company_id)
            .first()
        )

        if company_user:
            # Update role if needed
            if company_user.RoleID != role.RoleID:
                company_user.RoleID = role.RoleID
                db.commit()
                db.refresh(company_user)
                logger.info(
                    f"Updated CompanyUser {company_user.ID} to role '{role_name}'"
                )
        else:
            # Create new CompanyUser
            company_user = CompanyUser(
                UserID=user_id,
                CompanyID=company_id,
                RoleID=role.RoleID,
            )
            db.add(company_user)
            db.commit()
            db.refresh(company_user)
            logger.info(f"Created new CompanyUser with role '{role_name}'")
    except Exception as e:
        logger.error(f"Error in upsert_company_user_role: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@app.put("/v1/user/{user_id}/admin", response_model=UserResponse, tags=["CompanyUser"])
async def update_user_role_by_admin(
    user_id: str,
    user_data: dict,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_user),
):
    db_company = (
        db.query(CompanyDetailsInfo)
        .filter(CompanyDetailsInfo.CompanyDetailsID == user_data["company_id"])
        .first()
    )

    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")

    company_user = ensure_company_user_relation(
        db, user_id=current_user.ClerkID, company_id=user_data["company_id"]
    )
    if company_user.RoleID != ADMIN_ROLE_ID:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    db_user = db.query(UserDetails).filter(UserDetails.ClerkID == user_id).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if db_user.ClerkID == current_user.ClerkID:
        raise HTTPException(status_code=400, detail="Can't change your own role")

    get_company_user_relation(
        db,
        user_id=db_user.ClerkID,
        company_id=user_data["company_id"],
        role_name=user_data["role"],
    )

    return db_user


@app.put("/v1/user/{user_id}", response_model=UserResponse, tags=["Users"])
async def update_user_endpoint(
    user_id: str,
    user_data: dict,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_active_user),
):
    db_user = db.query(UserDetails).filter(UserDetails.ClerkID == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    previous_company_id = db_user.CompanyDetailsID

    if "UserName" in user_data:
        db_user.UserName = user_data["UserName"]
    if "Email" in user_data:
        db_user.Email = user_data["Email"]
    if "Password" in user_data:
        db_user.Password = user_data["Password"]
    if "RoleID" in user_data:
        db_user.RoleID = user_data["RoleID"]
    if "CompanyDetailsID" in user_data:
        db_user.CompanyDetailsID = user_data["CompanyDetailsID"]

    db.commit()
    db.refresh(db_user)

    if previous_company_id != db_user.CompanyDetailsID and db_user.CompanyDetailsID:
        company_user = ensure_company_user_relation(
            db=db,
            user_id=db_user.ClerkID,
            company_id=db_user.CompanyDetailsID,
        )

        sync_clerk_user_metadata(user=db_user, company_user=company_user)

    return db_user


@app.delete("/v1/user/{user_id}", tags=["Users"])
async def delete_user_endpoint(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(
        get_current_active_admin
    ),  # Protect this endpoint with admin check
):
    db_user = db.query(UserDetails).filter(UserDetails.ClerkID == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}


@app.put("/v1/users/{user_id}/role", response_model=UserResponse, tags=["Users"])
def update_user_role(
    user_id: str,
    request: UpdateUserRoleRequest,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_active_admin),
):
    db_user = db.query(UserDetails).filter(UserDetails.ClerkID == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db_role = (
        db.query(RoleDetails).filter(RoleDetails.UserRole == request.user_role).first()
    )
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")

    db_user.RoleID = db_role.RoleID
    db.commit()
    db.refresh(db_user)
    return db_user


#  API for all applications


@app.post("/v1/upload/csv/{company_id}", tags=["CSV Operations"])
async def upload_csv(
    company_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_user),
):
    # Check if the company exists
    company = (
        db.query(CompanyDetailsInfo)
        .filter(CompanyDetailsInfo.CompanyDetailsID == company_id)
        .first()
    )
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # Authorization check
    company_user = ensure_company_user_relation(
        db, user_id=current_user.ClerkID, company_id=company_id
    )
    if company_user.RoleID != ADMIN_ROLE_ID:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files can be uploaded")

    try:
        contents = await file.read()
        csv_data = contents.decode("utf-8").splitlines()
        csv_reader = csv.reader(csv_data)

        header = next(csv_reader, None)
        if not header or len(header) < 12:
            raise HTTPException(
                status_code=400,
                detail="CSV header format is incorrect or missing columns",
            )

        duplicates = set()
        new_entries = set()

        for idx, row in enumerate(csv_reader, start=2):
            if len(row) < 12:
                raise HTTPException(
                    status_code=400, detail=f"Row {idx} is malformed: {row}"
                )

            try:
                CommodityName = row[0]
                PartNumber = row[1]
                VendorName = row[3]
                MaterialGroupNumber = row[4]
                MaterialGroupDescription = row[5]
                OrderQuantity = float(row[6])
                NetPrice = float(row[7])
                ToBeDeliveredQty = float(row[9])
                Location = row[10]
                Country = row[11]
            except ValueError as ve:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid numeric value in row {idx}: {ve}",
                )

            try:
                DocumentDate = datetime.strptime(row[2], "%d/%m/%Y").date()  # converts '13/05/2024' to datetime.date(2024, 5, 13)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid date format in row {idx}: {row[2]}")

            # === Commodity ===
            Commodity = (
                db.query(CommodityDetails)
                .filter_by(
                    PartNumber=PartNumber,
                    CommodityName=CommodityName,
                    CompanyDetailsID=company_id,
                )
                .first()
            )
            if not Commodity:
                Commodity = CommodityDetails(
                    PartNumber=PartNumber,
                    CommodityName=CommodityName,
                    CompanyDetailsID=company_id,
                )
                db.add(Commodity)
                db.flush()
                new_entries.add(f"Commodity: {CommodityName}")
            else:
                duplicates.add(f"Commodity: {CommodityName}")

            # === Material Group ===
            MaterialGroup = (
                db.query(MaterialGroupDetails)
                .filter_by(
                    MaterialGroupNumber=MaterialGroupNumber,
                    MaterialGroupDescription=MaterialGroupDescription,
                    CompanyDetailsID=company_id,
                )
                .first()
            )
            if not MaterialGroup:
                MaterialGroup = MaterialGroupDetails(
                    MaterialGroupNumber=MaterialGroupNumber,
                    MaterialGroupDescription=MaterialGroupDescription,
                    CompanyDetailsID=company_id,
                )
                db.add(MaterialGroup)
                db.flush()
                new_entries.add(f"MaterialGroup: {MaterialGroupNumber}")
            else:
                duplicates.add(f"MaterialGroup: {MaterialGroupNumber}")

            # === Vendor ===
            Vendor = (
                db.query(VendorDetails)
                .filter_by(
                    VendorName=VendorName,
                    Location=Location,
                    Country=Country,
                    CompanyDetailsID=company_id,
                )
                .first()
            )
            if not Vendor:
                Vendor = VendorDetails(
                    VendorName=VendorName,
                    Location=Location,
                    Country=Country,
                    CompanyDetailsID=company_id,
                )
                db.add(Vendor)
                db.flush()
                new_entries.add(f"Vendor: {VendorName}")
            else:
                duplicates.add(f"Vendor: {VendorName}")

            # === Purchase Order ===
            PurchaseOrderExists = (
                db.query(PurchaseOrderDetails)
                .filter_by(
                    OrderQuantity=OrderQuantity,
                    NetPrice=NetPrice,
                    ToBeDeliveredQty=ToBeDeliveredQty,
                    DocumentDate=DocumentDate,
                    CommodityID=Commodity.CommodityID,
                    VendorID=Vendor.VendorID,
                    MaterialGroupID=MaterialGroup.MaterialGroupID,
                    CompanyDetailsID=company_id,
                )
                .first()
            )

            if not PurchaseOrderExists:
                PurchaseOrder = PurchaseOrderDetails(
                    OrderQuantity=OrderQuantity,
                    NetPrice=NetPrice,
                    ToBeDeliveredQty=ToBeDeliveredQty,
                    DocumentDate=DocumentDate,
                    CommodityID=Commodity.CommodityID,
                    VendorID=Vendor.VendorID,
                    MaterialGroupID=MaterialGroup.MaterialGroupID,
                    CompanyDetailsID=company_id,
                )
                db.add(PurchaseOrder)
                new_entries.add(f"PurchaseOrder: {DocumentDate}")
            else:
                duplicates.add(f"PurchaseOrder: {DocumentDate}")

        db.commit()

        return {
            "message": "CSV file uploaded and stored successfully",
            "new_entries": list(new_entries),
            "duplicates": list(duplicates),
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"CSV processing failed: {str(e)}")


@app.get("/v1/download/csv/{company_id}", tags=["CSV Operations"])
async def download_csv(
    company_id: str,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_active_user),
):
    company = (
        db.query(CompanyDetailsInfo).filter_by(CompanyDetailsID=company_id).first()
    )
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    output = StringIO()
    writer = csv.writer(output)

    # Write CSV header
    writer.writerow(
        [
            "CommodityName",
            "PartNumber",
            "DocumentDate",
            "VendorName",
            "MaterialGroupNumber",
            "MaterialGroupDescription",
            "OrderQuantity",
            "NetPrice",
            "Currency",
            "ToBeDeliveredQty",
            "Location",
            "Country",
        ]
    )

    # Query and write data rows
    purchase_orders = (
        db.query(PurchaseOrderDetails).filter_by(CompanyDetailsID=company_id).all()
    )
    for po in purchase_orders:
        commodity = (
            db.query(CommodityDetails).filter_by(CommodityID=po.CommodityID).first()
        )
        vendor = db.query(VendorDetails).filter_by(VendorID=po.VendorID).first()
        material_group = (
            db.query(MaterialGroupDetails)
            .filter_by(MaterialGroupID=po.MaterialGroupID)
            .first()
        )
        currency = company.Currency.Currency  # Access the Currency attribute directly

        writer.writerow(
            [
                commodity.CommodityName,
                commodity.PartNumber,
                po.DocumentDate,
                vendor.VendorName,
                material_group.MaterialGroupNumber,
                material_group.MaterialGroupDescription,
                po.OrderQuantity,
                po.NetPrice,
                currency,
                po.ToBeDeliveredQty,
                vendor.Location,
                vendor.Country,
            ]
        )

    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={company_id}_purchase_orders.csv"
        },
    )


# Header View

# api for total spend


# Endpoint to fetch summary counts by company ID
# Combined API endpoint to fetch all counts
@app.get("/v1/headerview/{company_id}", tags=["Header View"])
def summary_counts(
    company_id: str, current_user: UserDetails = Depends(get_current_active_user)
):
    query = (
        """
        SELECT * FROM public.headerview
        where "Company ID" = \'"""
        + company_id
        + """\';
    """
    )

    try:
        df = pd.read_sql(query, engine)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    if df.empty:
        raise HTTPException(status_code=404, detail="No data found")

    summary = {
        "company_id": str(df["Company ID"].iloc[0]),
        "total_spend": float(df["Total Spend"].iloc[0]),
        "supplier_count": float(df["Supplier Count"].iloc[0]),
        "commodity_count": float(df["Commodity Count"].iloc[0]),
        "location_count": float(df["Location Count"].iloc[0]),
        "po_count": float(df["PO Count"].iloc[0]),
    }

    return summary


# Spending by supplier view
# api to get spending by supplier
@app.get("/v1/spending/supplier/{company_id}", tags=["Spending Views"])
def supplier_spend(
    company_id: str, current_user: UserDetails = Depends(get_current_active_user)
):
    query = (
        """SELECT * FROM public."supplierview"
    where "Company ID" = \'"""
        + company_id
        + """\';
    """
    )
    df = pd.read_sql(query, conn).to_dict(orient="records")
    return {"supplier_spend": df}


# api to get spending by month
@app.get("/v1/spending/month/{company_id}", tags=["Spending Views"])
def month_spend(
    company_id: str, current_user: UserDetails = Depends(get_current_active_user)
):
    query = (
        """SELECT * FROM public."monthspend"
    where "Company ID" = \'"""
        + company_id
        + """\';
    """
    )
    df = pd.read_sql(query, conn).to_dict(orient="records")
    return {"month_spend": df}


# api to get Spending By Commodity
@app.get("/v1/spending/commodity/{company_id}", tags=["Spending Views"])
def commodity_spend(
    company_id: str, current_user: UserDetails = Depends(get_current_active_user)
):
    query = (
        """SELECT * FROM public."commodityspend" 
    where "CompanyDetailsID" = \'"""
        + company_id
        + """\';
    """
    )
    df = pd.read_sql(query, conn).to_dict(orient="records")
    return {"commodity_spend": df}


# api to get Spending by Location
@app.get("/v1/spending/location/{company_id}", tags=["Spending Views"])
def location_spend(
    company_id: str, current_user: UserDetails = Depends(get_current_active_user)
):
    query = (
        """SELECT * FROM public."locationspend"
    where "Company ID" = \'"""
        + company_id
        + """\';"""
    )
    df = pd.read_sql(query, conn).to_dict(orient="records")
    return {"location_spend": df}


# api to get TopSupplierSpend
@app.get(
    "/v1/spending/top_supplier/{company_id}",
    tags=["Spending Views"],
    response_model=PaginatedResponse,
)
def top_supplier_spend(
    company_id: str,
    skip: int = 0,
    limit: int = 10,
    current_user: UserDetails = Depends(get_current_active_user),
):
    if skip < 0:
        raise HTTPException(
            status_code=400, detail="skip parameter must be greater than or equal to 0"
        )
    if limit < 1 or limit > 100:
        raise HTTPException(
            status_code=400, detail="limit parameter must be between 1 and 100"
        )

    query = f"""
    SELECT * FROM public."topsupplierspend"
    WHERE "Company ID" = '{company_id}'
    OFFSET {skip}
    LIMIT {limit};
    """
    total_query = f"""
    SELECT COUNT(*) FROM public."topsupplierspend"
    WHERE "Company ID" = '{company_id}';
    """
    df = pd.read_sql(query, conn)
    total = pd.read_sql(total_query, conn).iloc[0, 0]

    return PaginatedResponse(total=total, items=df.to_dict(orient="records"))


# Define your POST endpoint
@app.post("/v1/projects", tags=["Sourcing Project"])
def create_sourcing_project_endpoint(
    project: SourcingProjectCreate,
    company_id: str,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_active_user),
):
    # Check if the company with provided CompanyDetailsID exists
    company = (
        db.query(CompanyDetailsInfo)
        .filter(CompanyDetailsInfo.CompanyDetailsID == company_id)
        .first()
    )
    if not company:
        raise HTTPException(
            status_code=404, detail=f"Company with ID {company_id} not found"
        )

    # Generate UUID for CommodityID
    commodity_id = str(uuid.uuid4())

    # Create CommodityDetails object
    commodity_details = CommodityDetails(
        CommodityID=commodity_id,
        CommodityName=project.CommodityName,
        AffectedProduct=project.CommodityAffectedProduct,
        PartNumber=project.CommodityPartNumber,
        PartDescription=project.CommodityPartDescription,
        CompanyDetailsID=company_id,  # Associate commodity with company
    )
    db.add(commodity_details)

    # Create SourcingProjectDetails object
    new_project = SourcingProjectDetails(
        SourcingProjectID=str(uuid.uuid4()),
        Name=project.Name,
        Objective=project.Objective,
        Saving=project.Saving,
        ProjectType=project.ProjectType,
        StartDate=project.StartDate,  # Directly assign if it's already a datetime.date object
        EndDate=(
            project.EndDate if project.EndDate else None
        ),  # Directly assign if it's already a datetime.date object
        Phase=project.Phase,
        Status=project.Status,
        SourcingPmEmail=project.SourcingPmEmail,
        ScmManagerEmail=project.ScmManagerEmail,
        SelectedSupplierPmEmail=project.SelectedSupplierPmEmail,
        BuyerEmail=project.BuyerEmail,
        ProjectSponserEmail=project.ProjectSponserEmail,
        FinancePocEmail=project.FinancePocEmail,
        ProjectInterval=project.ProjectInterval,
        CompanyDetailsID=company_id,
        CommodityID=commodity_id,  # Associate project with commodity
    )
    db.add(new_project)

    db.commit()
    db.refresh(new_project)

    return {
        "message": "Sourcing project created successfully",
        "project_id": new_project.SourcingProjectID,
    }


pass


# api to get SourcingProject
@app.get(
    "/v1/projects",
    tags=["Sourcing Project"],
    response_model=PaginatedResponse[SourcingProjectDetailsResponse],
)
async def get_projects(
    project_id: Optional[str] = None,
    company_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_active_user),
):
    if skip < 0:
        raise HTTPException(
            status_code=400, detail="skip parameter must be greater than or equal to 0"
        )
    if limit < 1 or limit > 100:
        raise HTTPException(
            status_code=400, detail="limit parameter must be between 1 and 100"
        )

    query = db.query(SourcingProjectDetails)

    if project_id:
        project = query.filter(
            SourcingProjectDetails.SourcingProjectID == project_id
        ).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        return PaginatedResponse(
            total=1, items=[SourcingProjectDetailsResponse.from_orm(project)]
        )
    elif company_id:
        query = query.filter(SourcingProjectDetails.CompanyDetailsID == company_id)

    paginated_result = paginate(query, skip, limit)
    paginated_result.items = [
        SourcingProjectDetailsResponse.from_orm(project)
        for project in paginated_result.items
    ]
    return paginated_result


@app.put("/v1/projects/{project_id}", tags=["Sourcing Project"])
def update_sourcing_project_endpoint(
    project_id: str,
    project_update: SourcingProjectUpdate,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_active_user),
):
    # Fetch the existing project
    project = (
        db.query(SourcingProjectDetails)
        .filter(SourcingProjectDetails.SourcingProjectID == project_id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Sourcing project not found")

    # Update project details
    if project_update.Name is not None:
        project.Name = project_update.Name
    if project_update.Objective is not None:
        project.Objective = project_update.Objective
    if project_update.Saving is not None:
        project.Saving = project_update.Saving
    if project_update.ProjectType is not None:
        project.ProjectType = project_update.ProjectType
    if project_update.StartDate is not None:
        project.StartDate = project_update.StartDate
    if project_update.EndDate is not None:
        project.EndDate = project_update.EndDate
    if project_update.Phase is not None:
        project.Phase = project_update.Phase
    if project_update.Status is not None:
        project.Status = project_update.Status
    if project_update.SourcingPmEmail is not None:
        project.SourcingPmEmail = project_update.SourcingPmEmail
    if project_update.ScmManagerEmail is not None:
        project.ScmManagerEmail = project_update.ScmManagerEmail
    if project_update.SelectedSupplierPmEmail is not None:
        project.SelectedSupplierPmEmail = project_update.SelectedSupplierPmEmail
    if project_update.BuyerEmail is not None:
        project.BuyerEmail = project_update.BuyerEmail
    if project_update.ProjectSponserEmail is not None:
        project.ProjectSponserEmail = project_update.ProjectSponserEmail
    if project_update.FinancePocEmail is not None:
        project.FinancePocEmail = project_update.FinancePocEmail
    if project_update.ProjectInterval is not None:
        project.ProjectInterval = project_update.ProjectInterval

    # Update commodity details if provided
    if (
        project_update.CommodityName
        or project_update.CommodityAffectedProduct
        or project_update.CommodityPartNumber
        or project_update.CommodityPartDescription
    ):
        commodity = (
            db.query(CommodityDetails)
            .filter(CommodityDetails.CommodityID == project.CommodityID)
            .first()
        )
        if commodity:
            if project_update.CommodityName is not None:
                commodity.CommodityName = project_update.CommodityName
            if project_update.CommodityAffectedProduct is not None:
                commodity.AffectedProduct = project_update.CommodityAffectedProduct
            if project_update.CommodityPartNumber is not None:
                commodity.PartNumber = project_update.CommodityPartNumber
            if project_update.CommodityPartDescription is not None:
                commodity.PartDescription = project_update.CommodityPartDescription

    # Commit the transaction
    db.commit()
    db.refresh(project)

    return {
        "message": "Sourcing project updated successfully",
        "project_id": project.SourcingProjectID,
    }


# Endpoint to delete project by project_id
@app.delete("/v1/projects/{project_id}", tags=["Sourcing Project"], status_code=204)
def delete_project_by_id(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_active_user),
):
    project = (
        db.query(SourcingProjectDetails)
        .filter(SourcingProjectDetails.SourcingProjectID == project_id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return {"detail": "Project deleted successfully"}


# Endpoint for companydetails
@app.post(
    "/v1/CompanyDetails", response_model=CompanyDetailsCreate, tags=["Company Details"]
)
def create_company_details(
    company: CompanyDetailsCreate,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_user),
):
    currency = CurrencyDetails(Currency=company.Currency.Currency)
    db.add(currency)
    db.commit()
    db.refresh(currency)

    company_details = CompanyDetailsInfo(
        DisplayName=company.DisplayName,
        PhoneNumber=company.PhoneNumber,
        Email=company.Email,
        LegalName=company.LegalName,
        RegistrationNumber=company.RegistrationNumber,
        VatNumber=company.VatNumber,
        Address=company.Address,
        City=company.City,
        Country=company.Country,
        Zip=company.Zip,
        CurrencyID=currency.CurrencyID,
    )
    db.add(company_details)
    db.commit()
    db.refresh(company_details)

    company_id = company_details.CompanyDetailsID

    role = db.query(RoleDetails).filter(RoleDetails.UserRole == "admin").first()
    if not role:
        role = RoleDetails(UserRole="admin")
        db.add(role)
        db.commit()
        db.refresh(role)

    company_user = CompanyUser(
        UserID=current_user.ClerkID,
        CompanyID=company_id,
        RoleID=role.RoleID,
    )
    db.add(company_user)
    db.commit()
    logger.info(f"Created CompanyUser link for admin: {company_user}")

    return company_details


pass


@app.get(
    "/v1/company_details",
    response_model=List[CompanyDetailsInfoSchema],
    tags=["Company Details"],
)
def get_companies(
    company_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_active_user),
):
    if company_id:
        db_company = (
            db.query(CompanyDetailsInfo)
            .filter(CompanyDetailsInfo.CompanyDetailsID == company_id)
            .first()
        )
        if not db_company:
            raise HTTPException(status_code=404, detail="Company not found")
        return [db_company]
    else:
        db_companies = db.query(CompanyDetailsInfo).all()
        if not db_companies:
            raise HTTPException(status_code=404, detail="No companies found")
        return db_companies


# api for update company details
@app.put("/v1/CompanyDetails/{company_id}", tags=["Company Details"])
def update_company(
    company_id: str,
    company: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_user),
):
    db_company = (
        db.query(CompanyDetailsInfo)
        .filter(CompanyDetailsInfo.CompanyDetailsID == company_id)
        .first()
    )

    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")

    company_user = ensure_company_user_relation(
        db, user_id=current_user.ClerkID, company_id=company_id
    )

    if company_user.RoleID != ADMIN_ROLE_ID:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    update_data = company.dict(exclude_unset=True)

    for key, value in update_data.items():
        if key == "Currency" and value is not None:
            db_currency = (
                db.query(CurrencyDetails)
                .filter(CurrencyDetails.CurrencyID == db_company.CurrencyID)
                .first()
            )
            if not db_currency:
                raise HTTPException(status_code=404, detail="Currency not found")
            for currency_key, currency_value in value.items():
                setattr(db_currency, currency_key, currency_value)
        else:
            setattr(db_company, key, value)

    db.commit()
    db.refresh(db_company)
    return db_company


@app.delete("/v1/CompanyDetails/{company_id}", tags=["Company Details"])
async def delete_company(
    company_id: str,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_user),
):
    db_company = (
        db.query(CompanyDetailsInfo)
        .filter(CompanyDetailsInfo.CompanyDetailsID == company_id)
        .first()
    )

    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")

    company_user = ensure_company_user_relation(
        db, user_id=current_user.ClerkID, company_id=company_id
    )

    if company_user.RoleID != ADMIN_ROLE_ID:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    db.delete(db_company)
    db.commit()

    return {"message": "Company deleted successfully"}


@app.post(
    "/v1/SupplierEvaluation/{project_id}",
    response_model=SupplierEvaluationResponse,
    tags=["Supplier Evaluation"],
)
def create_supplier_evaluation(
    project_id: str,
    supplier_eval: SupplierEvaluationCreate,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_active_user),
):
    # Fetch the Sourcing Project and its associated CompanyDetailsID
    project = (
        db.query(SourcingProjectDetails)
        .filter(SourcingProjectDetails.SourcingProjectID == project_id)
        .first()
    )
    if project is None:
        raise HTTPException(status_code=404, detail="Sourcing Project not found")

    company_details_id = project.CompanyDetailsID

    # Calculate RankingTotalResult
    ranking_total_result = (
        supplier_eval.CompanySizeRank
        + supplier_eval.CriticalPartsRank
        + supplier_eval.NonCriticalPartsRank
        + supplier_eval.RevenueRank
        + supplier_eval.OnTimeDeliveryRank
        + supplier_eval.SupplierHealthRank
        + supplier_eval.AvgAnnualRAndDSpentRank
        + supplier_eval.OrderFulfilmentRateRank
        + supplier_eval.LocationRank
    )

    # Create new Supplier Evaluation
    new_evaluation = SupplierEvaluationDetails(
        SupplierEvaluationID=str(uuid.uuid4()),
        SupplierName=supplier_eval.SupplierName,
        CompanySizeRank=supplier_eval.CompanySizeRank,
        CriticalPartsRank=supplier_eval.CriticalPartsRank,
        NonCriticalPartsRank=supplier_eval.NonCriticalPartsRank,
        RevenueRank=supplier_eval.RevenueRank,
        OnTimeDeliveryRank=supplier_eval.OnTimeDeliveryRank,
        SupplierHealthRank=supplier_eval.SupplierHealthRank,
        AvgAnnualRAndDSpentRank=supplier_eval.AvgAnnualRAndDSpentRank,
        OrderFulfilmentRateRank=supplier_eval.OrderFulfilmentRateRank,
        LocationRank=supplier_eval.LocationRank,
        RankingTotalResult=ranking_total_result,
        CompanyDetailsID=company_details_id,
        SourcingProjectID=project_id,
    )

    db.add(new_evaluation)
    db.commit()
    db.refresh(new_evaluation)
    return new_evaluation


@app.get(
    "/v1/supplier_evaluations",
    response_model=PaginatedResponse,
    tags=["Supplier Evaluation"],
)
def get_supplier_evaluations(
    project_id: Optional[str] = None,
    supplier_evaluation_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_active_user),
):
    if skip < 0:
        raise HTTPException(
            status_code=400, detail="skip parameter must be greater than or equal to 0"
        )
    if limit < 1 or limit > 100:
        raise HTTPException(
            status_code=400, detail="limit parameter must be between 1 and 100"
        )

    query = db.query(SupplierEvaluationDetails)

    if supplier_evaluation_id:
        evaluation = query.filter(
            SupplierEvaluationDetails.SupplierEvaluationID == supplier_evaluation_id
        ).first()
        if not evaluation:
            raise HTTPException(status_code=404, detail="Supplier evaluation not found")
        return PaginatedResponse(
            total=1, items=[SupplierEvaluationResponse.from_orm(evaluation)]
        )
    elif project_id:
        query = query.filter(SupplierEvaluationDetails.SourcingProjectID == project_id)

    paginated_result = paginate(query, skip, limit)
    paginated_result.items = [
        SupplierEvaluationResponse.from_orm(evaluation)
        for evaluation in paginated_result.items
    ]
    return paginated_result


@app.put(
    "/v1/SupplierEvaluation/{supplier_evaluation_id}",
    response_model=SupplierEvaluationResponse,
    tags=["Supplier Evaluation"],
)
def update_supplier_evaluation(
    supplier_evaluation_id: str,
    supplier_eval: SupplierEvaluationUpdate,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_active_user),
):
    evaluation = (
        db.query(SupplierEvaluationDetails)
        .filter(
            SupplierEvaluationDetails.SupplierEvaluationID == supplier_evaluation_id
        )
        .first()
    )
    if not evaluation:
        raise HTTPException(status_code=404, detail="Supplier evaluation not found")

    # Update fields
    evaluation.SupplierName = supplier_eval.SupplierName
    evaluation.CompanySizeRank = supplier_eval.CompanySizeRank
    evaluation.CriticalPartsRank = supplier_eval.CriticalPartsRank
    evaluation.NonCriticalPartsRank = supplier_eval.NonCriticalPartsRank
    evaluation.RevenueRank = supplier_eval.RevenueRank
    evaluation.OnTimeDeliveryRank = supplier_eval.OnTimeDeliveryRank
    evaluation.SupplierHealthRank = supplier_eval.SupplierHealthRank
    evaluation.AvgAnnualRAndDSpentRank = supplier_eval.AvgAnnualRAndDSpentRank
    evaluation.OrderFulfilmentRateRank = supplier_eval.OrderFulfilmentRateRank
    evaluation.LocationRank = supplier_eval.LocationRank

    # Recalculate RankingTotalResult
    evaluation.RankingTotalResult = (
        supplier_eval.CompanySizeRank
        + supplier_eval.CriticalPartsRank
        + supplier_eval.NonCriticalPartsRank
        + supplier_eval.RevenueRank
        + supplier_eval.OnTimeDeliveryRank
        + supplier_eval.SupplierHealthRank
        + supplier_eval.AvgAnnualRAndDSpentRank
        + supplier_eval.OrderFulfilmentRateRank
        + supplier_eval.LocationRank
    )

    db.commit()
    db.refresh(evaluation)
    return evaluation


@app.delete(
    "/v1/SupplierEvaluation/{supplier_evaluation_id}",
    response_model=dict,
    tags=["Supplier Evaluation"],
)
def delete_supplier_evaluation(
    supplier_evaluation_id: str,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_active_admin),
):
    evaluation = (
        db.query(SupplierEvaluationDetails)
        .filter(
            SupplierEvaluationDetails.SupplierEvaluationID == supplier_evaluation_id
        )
        .first()
    )
    if not evaluation:
        raise HTTPException(status_code=404, detail="Supplier evaluation not found")

    db.delete(evaluation)
    db.commit()
    return {"detail": "Supplier evaluation deleted successfully"}


@app.post(
    "/v1/comments/{project_id}",
    response_model=CommentResponseWithUser,
    tags=["Comments"],
)
def create_comment(
    project_id: str,
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(
        get_current_active_user
    ),  # Only users and admins can access
):
    project = (
        db.query(SourcingProjectDetails)
        .filter(SourcingProjectDetails.SourcingProjectID == project_id)
        .first()
    )
    if project is None:
        raise HTTPException(status_code=404, detail="Sourcing Project not found")

    company_details_id = project.CompanyDetailsID

    new_comment = CommentDetails(
        CommentID=str(uuid.uuid4()),
        Comment=comment.Comment,
        CommentDate=comment.CommentDate,
        CompanyDetailsID=company_details_id,
        SourcingProjectID=project_id,
        ClerkID=current_user.ClerkID,
    )

    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return {
        "CommentID": new_comment.CommentID,
        "Comment": new_comment.Comment,
        "CommentDate": new_comment.CommentDate,
        "CompanyDetailsID": new_comment.CompanyDetailsID,
        "SourcingProjectID": new_comment.SourcingProjectID,
        "ClerkID": new_comment.ClerkID,
        "User": current_user,
    }


@app.get(
    "/v1/comments/{project_id}",
    response_model=list[CommentResponseWithUser],
    tags=["Comments"],
)
def get_comments_by_project_id(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_active_user),
):
    comments = (
        db.query(CommentDetails)
        .filter(CommentDetails.SourcingProjectID == project_id)
        .options(joinedload(CommentDetails.User))
        .all()
    )
    if not comments:
        raise HTTPException(
            status_code=404, detail="No comments found for this project ID"
        )
    return comments


@app.get(
    "/v1/comments/{comment_id}",
    response_model=CommentResponseWithUser,
    tags=["Comments"],
)
def get_comment_by_id(
    comment_id: str,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_active_user),
):
    comment = (
        db.query(CommentDetails)
        .filter(CommentDetails.CommentID == comment_id)
        .options(joinedload(CommentDetails.User))
        .first()
    )
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment


@app.put(
    "/v1/comments/{comment_id}",
    response_model=CommentResponseWithUser,
    tags=["Comments"],
)
def update_comment(
    comment_id: str,
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_active_user),
):
    db_comment = (
        db.query(CommentDetails).filter(CommentDetails.CommentID == comment_id).first()
    )
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    # Update fields
    db_comment.Comment = comment.Comment
    db_comment.CommentDate = comment.CommentDate
    db_comment.UserID = comment.UserID

    db.commit()
    db.refresh(db_comment)

    user = db.query(UserDetails).filter(UserDetails.ClerkID == comment.UserID).first()
    return {**db_comment.__dict__, "User": user}


@app.delete("/v1/comments/{comment_id}", response_model=dict, tags=["Comments"])
def delete_comment(
    comment_id: str,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_active_user),
):
    comment = (
        db.query(CommentDetails).filter(CommentDetails.CommentID == comment_id).first()
    )
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    db.delete(comment)
    db.commit()
    return {"detail": "Comment deleted successfully"}


# @app.get("/users/me")
# def read_users_me(current_user: dict = Depends(get_current_user)):
#     return current_user


@app.post("/v1/projectUsers/", tags=["ProjectUsers"])
def link_user_project(
    link: UserProjectLink,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_active_user),
):
    user = db.query(UserDetails).filter(UserDetails.ClerkID == link.ClerkID).first()
    project = (
        db.query(SourcingProjectDetails)
        .filter(SourcingProjectDetails.SourcingProjectID == link.SourcingProjectID)
        .first()
    )

    if not user or not project:
        raise HTTPException(status_code=404, detail="User or Project not found")

    association = ProjectUsersDetails(
        ClerkID=link.ClerkID, SourcingProjectID=link.SourcingProjectID
    )
    db.add(association)
    db.commit()
    return {"message": "User linked to project successfully"}


@app.get(
    "/v1/projectUsers/{project_id}/",
    response_model=List[UserProjectLink],
    tags=["ProjectUsers"],
)
def get_users_in_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_active_user),
):
    associations = (
        db.query(ProjectUsersDetails)
        .filter(ProjectUsersDetails.SourcingProjectID == project_id)
        .all()
    )
    if not associations:
        raise HTTPException(status_code=404, detail="No users found for this project")
    return [
        {"ClerkID": assoc.ClerkID, "SourcingProjectID": assoc.SourcingProjectID}
        for assoc in associations
    ]


@app.put("/v1/projectUsers/", tags=["ProjectUsers"])
def update_user_project(
    link: UserProjectLink,
    update: UserProjectUpdate,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_active_user),
):
    association = (
        db.query(ProjectUsersDetails)
        .filter(
            ProjectUsersDetails.ClerkID == link.ClerkID,
            ProjectUsersDetails.SourcingProjectID == link.SourcingProjectID,
        )
        .first()
    )

    if not association:
        raise HTTPException(
            status_code=404, detail="User-Project association not found"
        )

    if update.newClerkID:
        association.ClerkID = update.newClerkID
    if update.newSourcingProjectID:
        association.SourcingProjectID = update.newSourcingProjectID

    db.commit()
    return {"message": "User-Project association updated successfully"}


@app.delete("/v1/projectUsers/", tags=["ProjectUsers"])
def delete_user_project(
    link: UserProjectLink,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_active_user),
):
    association = (
        db.query(ProjectUsersDetails)
        .filter(
            ProjectUsersDetails.ClerkID == link.ClerkID,
            ProjectUsersDetails.SourcingProjectID == link.SourcingProjectID,
        )
        .first()
    )

    if not association:
        raise HTTPException(
            status_code=404, detail="User-Project association not found"
        )

    db.delete(association)
    db.commit()
    return {"message": "User removed from project successfully"}


# Billing


@app.post("/create_order/")
def create_order(order_request: OrderRequest, db: Session = Depends(get_db)):
    try:
        # Step 1: Create an order with Razorpay
        order_data = {
            "amount": int(order_request.amount * 100),  # Convert to paise
            "currency": order_request.currency,
            "receipt": order_request.receipt,  # Unique receipt ID
            "payment_capture": 1,  # Auto capture
        }
        order = razorpay_client.order.create(data=order_data)

        # Step 2: Save order details in the database
        billing = BillingDetails(
            BillingID=order["id"],  # Store Razorpay order ID as BillingID
            BillingDate=date.today(),
            Description=order_request.description,
            Amount=order_request.amount,
            Status="Pending",
            PaymentPlan=order_request.payment_plan,
            PaymentMethod=order_request.payment_method,
        )
        db.add(billing)
        db.commit()
        db.refresh(billing)

        # Step 3: Return order details
        return {"order": order, "billing_id": billing.BillingID}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# @app.put("/update_payment_status/")
# def update_payment_status(update_request: UpdatePaymentStatusRequest, db: Session = Depends(get_db)):
#     # Fetch the billing record by BillingID
#     billing = db.query(BillingDetails).filter(BillingDetails.BillingID == update_request.billing_id).first()

#     if not billing:
#         raise HTTPException(status_code=404, detail="Billing record not found")

#     # Update the status
#     billing.Status = update_request.status

#     # Commit the changes
#     db.commit()
#     db.refresh(billing)

#     return {"message": "Payment status updated successfully", "billing": billing}


@app.put("/verify_payment/")
def verify_payment(
    payment_verification: PaymentVerification, db: Session = Depends(get_db)
):
    try:
        params_dict = {
            "razorpay_order_id": payment_verification.razorpay_order_id,
            "razorpay_payment_id": payment_verification.razorpay_payment_id,
            "razorpay_signature": payment_verification.razorpay_signature,
        }
        # Verifying the payment signature
        razorpay_client.utility.verify_payment_signature(params_dict)

        # Update billing status in the database
        billing = (
            db.query(BillingDetails)
            .filter_by(BillingID=payment_verification.razorpay_order_id)
            .first()
        )
        if billing:
            billing.Status = "Paid"
            db.commit()

        return {"status": "Payment verified successfully", "billing": billing}
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Payment verification failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
