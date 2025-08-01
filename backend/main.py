import csv
import hashlib
import hmac
import logging
import os
from datetime import datetime, timedelta, timezone
from io import StringIO
from typing import List, Optional

import pandas as pd
import razorpay
from clerk import *
from dotenv import load_dotenv
from fastapi import (APIRouter, BackgroundTasks, Depends, FastAPI, File,
                     HTTPException, Request, UploadFile)
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import (get_redoc_html, get_swagger_ui_html,
                                  get_swagger_ui_oauth2_redirect_html)
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer
from sqlalchemy import text
from sqlalchemy.exc import (IntegrityError, NoResultFound, OperationalError,
                            SQLAlchemyError)
from sqlalchemy.orm import Session, joinedload, selectinload, sessionmaker
from tenacity import (before_sleep_log, retry, retry_if_exception_type,
                      stop_after_attempt, wait_exponential, wait_fixed)

from clerk_client import clerk_client
from database import *
from models import *
from razor import razorpay_client
from rbac import (ADMIN_ROLE_ID, get_current_active_admin,
                  get_current_active_user, get_current_user)
from schema import *

load_dotenv()

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
    "https://detmo-seven.vercel.app"
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


# Configure tenacity logger
tenacity_logger = logging.getLogger("tenacity")
tenacity_logger.setLevel(logging.WARNING)

# Retry configuration
RETRY_CONFIG = {
    "stop": stop_after_attempt(3),
    "wait": wait_exponential(multiplier=1, min=4, max=10),  # 4s, 8s, 10s
    "before_sleep": before_sleep_log(tenacity_logger, logging.WARNING),
    "reraise": True,
}

# Retry settings: 3 attempts, wait 1 second between attempts
RETRY_KWARGS = dict(
    wait=wait_fixed(1),
    stop=stop_after_attempt(3),
    retry=retry_if_exception_type((IntegrityError, OperationalError)),
)


def get_or_create_default_currency(db: Session):
    currency = (
        db.query(CurrencyDetails).filter(CurrencyDetails.Currency == "USD").first()
    )

    if not currency:
        currency = CurrencyDetails(Currency="USD")
        db.add(currency)
        db.commit()
        db.refresh(currency)

    return currency


def create_company(
    db: Session, user_data: dict, currency_id: str
) -> CompanyDetailsInfo:
    """Create or get existing company for a user with comprehensive error handling"""
    try:
        clerk_id = user_data["id"]
        email = user_data["email_addresses"][0]["email_address"]

        # Validate inputs
        if not clerk_id:
            raise ValueError("Missing required ClerkID")
        if not email:
            raise ValueError("User email is required")
        if not currency_id:
            raise ValueError("Currency ID is required")

        # Check for existing company via user's default company
        existing_user = (
            db.query(UserDetails)
            .options(joinedload(UserDetails.DefaultCompany))
            .filter_by(ClerkID=clerk_id)
            .first()
        )

        if existing_user and existing_user.DefaultCompany:
            return existing_user.DefaultCompany

        # Verify currency exists
        currency = db.query(CurrencyDetails).get(currency_id)
        if not currency:
            raise ValueError(f"Currency with ID {currency_id} not found")

        # Create new company
        new_company = CompanyDetailsInfo(
            DisplayName=f"New Company for {user_data['first_name']} {user_data.get('last_name', '')}",
            PhoneNumber="1234567890",
            Email=email,
            LegalName="New Company LLC",
            RegistrationNumber="123456789",
            VatNumber="VAT123456",
            Address="123 New Street",
            City="New City",
            Country="New Country",
            Zip="12345",
            CurrencyID=currency_id,
        )

        db.add(new_company)
        try:
            db.flush()
            logger.info(
                f"Created new company {new_company.CompanyDetailsID} for user {clerk_id}"
            )
            return new_company
        except IntegrityError as e:
            db.rollback()
            logger.error(f"Company creation failed for user {clerk_id}: {str(e)}")
            raise ValueError(
                "Company creation failed due to database constraints"
            ) from e

    except KeyError as e:
        logger.error(f"Missing required field in user data: {str(e)}")
        raise ValueError(f"Invalid user data: missing {str(e)}") from e
    except SQLAlchemyError as e:
        logger.error(f"Database error during company creation: {str(e)}")
        raise ValueError("Database operation failed") from e
    except Exception as e:
        logger.error(f"Unexpected error in create_company: {str(e)}")
        raise ValueError("Failed to create company") from e


def create_user_and_link(
    db: Session, user_data: dict, role_id: str, company_id: str
) -> UserDetails:
    """Create a new user with guaranteed company relationship"""
    if not company_id:
        raise ValueError("Company ID must be provided for user creation")

    try:
        # Verify company exists first
        company = (
            db.query(CompanyDetailsInfo).filter_by(CompanyDetailsID=company_id).one()
        )
    except NoResultFound:
        raise ValueError(f"Company with ID {company_id} does not exist")

    email = user_data["email_addresses"][0]["email_address"]
    db_user = UserDetails(
        ClerkID=user_data["id"],
        UserName=f"{user_data['first_name']} {user_data.get('last_name', '')}",
        Email=email,
        Password="default_password",  # In production, use proper hashing
        RoleID=role_id,
        CompanyDetailsID=company_id,
        DefaultCompanyDetailsID=company_id,  # Ensured to match CompanyDetailsID
    )

    db.add(db_user)
    return db_user


def get_or_create_admin_role(db: Session):
    role = db.query(RoleDetails).filter_by(UserRole="admin").first()

    if not role:
        role = RoleDetails(UserRole="admin")
        db.add(role)
        db.flush()

    return role


def ensure_company_user_relation(
    db: Session, user_id: str, company_id: str, default_role_name: str = "user"
) -> CompanyUser:
    company_user = (
        db.query(CompanyUser)
        .filter(CompanyUser.UserID == user_id, CompanyUser.CompanyID == company_id)
        .first()
    )
    if company_user:
        return company_user

    role = (
        db.query(RoleDetails).filter(RoleDetails.UserRole == default_role_name).first()
    )
    if not role:
        role = RoleDetails(UserRole=default_role_name)
        db.add(role)
        db.flush()
        logger.info(f"Created default role '{default_role_name}' with ID {role.RoleID}")

    company_user = CompanyUser(
        UserID=user_id,
        CompanyID=company_id,
        RoleID=role.RoleID,
    )
    db.add(company_user)
    db.flush()
    return company_user


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def sync_clerk_user_metadata(user: UserDetails, company_user: CompanyUser):
    """
    Syncs the Clerk user's metadata with the role + paid status.
    Format: "<role>_<paid|unpaid>" in public_metadata["role"].
    """

    try:
        role_name = company_user.Role.UserRole if company_user.Role else "user"
        full_role = f"{role_name}_paid" if user.IsPaid else role_name

        clerk_user = clerk_client.users.get(user_id=user.ClerkID)
        current_metadata = clerk_user.public_metadata or {}

        if (
            current_metadata.get("role") != full_role
            or current_metadata.get("company_id") != company_user.CompanyID
        ):
            clerk_client.users.update_metadata(
                user_id=user.ClerkID,
                public_metadata={
                    **current_metadata,
                    "role": full_role,
                    "company_id": company_user.CompanyID,
                },
            )
            logger.info(
                f"Updated Clerk metadata: role='{full_role}' for user={user.ClerkID}"
            )
        else:
            logger.info(f"Clerk metadata already up-to-date for user={user.ClerkID}")
    except Exception as e:
        logger.warning(f"Failed to sync Clerk metadata for user {user.ClerkID}: {e}")


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
            # Create user with retry logic
            user, company_user = await run_in_threadpool(
                create_user, db, data, use_existing_company
            )

            # Sync metadata just once
            await run_in_threadpool(sync_clerk_user_metadata, user, company_user)

            # Process referral if exists in unsafe_metadata
            unsafe_metadata = data.get("unsafe_metadata", {})
            referral_code = unsafe_metadata.get("referralCode")

            if referral_code:
                try:
                    # 1. Prevent self-referrals
                    if referral_code == clerk_id:
                        logger.error(f"Self-referral attempt: {clerk_id}")
                        raise HTTPException(
                            status_code=400, detail="You cannot refer yourself"
                        )

                    # 2. Check if the referrer exists
                    referrer = (
                        db.query(UserDetails).filter_by(ClerkID=referral_code).first()
                    )

                    if not referrer:
                        logger.error(f"Referrer not found: {referral_code}")
                        raise HTTPException(
                            status_code=400,
                            detail="Referral code is invalid (referrer does not exist)",
                        )

                    # 3. Check if referee already has a referral (optional)
                    existing_referral = (
                        db.query(Referral).filter_by(RefereeID=clerk_id).first()
                    )
                    if existing_referral:
                        logger.error(f"User already has a referral: {clerk_id}")
                        raise HTTPException(
                            status_code=400,
                            detail="You already have an existing referral",
                        )
                    # Create referral entry
                    referral = Referral(
                        ReferrerID=referral_code,  # The clerkID of the referring user
                        RefereeID=clerk_id,  # The clerkID of the new user
                    )

                    db.add(referral)
                    db.commit()

                    logger.info(f"Created referral from {referral_code} to {clerk_id}")
                except Exception as e:
                    db.rollback()
                    logger.error(f"Failed to create referral: {str(e)}")

            return {"status": "created", "user_id": user.ClerkID}

        elif event_type == "user.updated":
            await update_user(db, data)

        elif event_type == "user.deleted":
            await delete_user(db, data["id"])

        # Only run metadata sync if we have a Clerk user ID
        if clerk_id:
            user = db.query(UserDetails).filter(UserDetails.ClerkID == clerk_id).first()
            if user and user.CompanyDetailsID:
                try:
                    company_user = ensure_company_user_relation(
                        db=db, user_id=user.ClerkID, company_id=user.CompanyDetailsID
                    )
                    db.commit()  # commit company_user addition

                    # Now safe to update Clerk metadata
                    sync_clerk_user_metadata(user=user, company_user=company_user)

                except Exception as e:
                    db.rollback()
                    logger.error(
                        f"Failed to ensure company-user relation or sync Clerk metadata: {e}"
                    )

        return {"message": "Webhook received"}

    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@retry(**RETRY_KWARGS)
def create_user(
    db: Session, user_data: dict, use_existing_company: bool
) -> tuple[UserDetails, CompanyUser]:
    try:
        clerk_id = user_data["id"]

        # Check for existing user in a single query
        existing_user = (
            db.query(UserDetails)
            .options(joinedload(UserDetails.DefaultCompany))
            .filter_by(ClerkID=clerk_id)
            .first()
        )

        if existing_user:
            logger.info(f"User already exists: {clerk_id}")
            company_user = (
                db.query(CompanyUser)
                .filter_by(
                    UserID=existing_user.ClerkID,
                    CompanyID=existing_user.DefaultCompanyDetailsID,
                )
                .first()
            )
            return existing_user, company_user

        # Start transaction implicitly (handled by FastDI's session)
        default_currency = get_or_create_default_currency(db)
        admin_role = get_or_create_admin_role(db)
        company = create_company(db, user_data, default_currency.CurrencyID)

        # This will raise if company doesn't exist
        user = create_user_and_link(
            db, user_data, admin_role.RoleID, company.CompanyDetailsID
        )

        # Create the company-user relationship
        company_user = ensure_company_user_relation(
            db=db,
            user_id=user.ClerkID,
            company_id=company.CompanyDetailsID,
            default_role_name=admin_role.UserRole,
        )

        # Commit everything together
        db.commit()
        db.refresh(user)
        db.refresh(company_user)

        return user, company_user

    except Exception as e:
        db.rollback()
        logger.error(f"User creation failed: {str(e)}")
        raise HTTPException(
            status_code=400, detail=f"Could not create user: {str(e)}"
        ) from e


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
        db_user = (
            db.query(UserDetails)
            .options(
                selectinload(UserDetails.CompanyLinks)
            )  # ensure CompanyUser links are loaded
            .filter(UserDetails.ClerkID == user_id)
            .first()
        )

        if not db_user:
            logger.warning(
                f"User with ClerkID {user_id} not found in database. Skipping delete."
            )
            return

        default_company_id = db_user.DefaultCompanyDetailsID

        company = (
            db.query(CompanyDetailsInfo)
            .filter(CompanyDetailsInfo.CompanyDetailsID == default_company_id)
            .first()
        )

        if company:
            db.delete(company)
            db.commit()

        db.delete(db_user)
        db.commit()
        logger.info(f"User deleted: {db_user}")  # Log the deleted user for debugging
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
    db.commit()
    if company_user.RoleID != ADMIN_ROLE_ID:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    company_users = (
        db.query(CompanyUser)
        .options(
            joinedload(CompanyUser.User)
            .joinedload(UserDetails.SubscriptionsReceived)
            .joinedload(PaymentSubscription.Payer),
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
                "Subscription": get_full_subscription_details(
                    cu.User.SubscriptionsReceived
                ),
            }
            for cu in company_users
        ]
    }


def get_full_subscription_details(subscriptions: list) -> Optional[dict] | str:
    """Returns complete subscription details with payer info"""
    if not subscriptions:
        return None

    sub = subscriptions[0]
    if sub.Status not in ["pending", "active"]:
        return None

    return {
        # Subscription IDs
        "system_subscription_id": sub.SubscriptionID,
        "razorpay_subscription_id": sub.RazorpaySubscriptionID,
        # Status and dates
        "status": sub.Status,
        "start_date": sub.StartDate.isoformat() if sub.StartDate else None,
        "end_date": sub.EndDate.isoformat() if sub.EndDate else None,
        "next_billing_date": (
            sub.NextBillingDate.isoformat() if sub.NextBillingDate else None
        ),
        # Full payer details
        "payer": get_payer_details(sub.Payer) if sub.Payer else None,
    }


def get_payer_details(payer: UserDetails) -> dict:
    """Returns complete payer information"""
    return {
        "clerk_id": payer.ClerkID,
        "name": payer.UserName,
        "email": payer.Email,
        "company_id": payer.CompanyDetailsID,
    }


@app.get("/v1/users", response_model=PaginatedResponse[UserResponse], tags=["Users"])
async def get_users(
    user_id: Optional[str] = None,
    company_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_user),
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
    db.commit()
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
        db.commit()

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
    db.commit()
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
                DocumentDate = datetime.strptime(
                    row[2], "%d/%m/%Y"
                ).date()  # converts '13/05/2024' to datetime.date(2024, 5, 13)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid date format in row {idx}: {row[2]}",
                )

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
    if not company_id or company_id == "undefined":
        raise HTTPException(status_code=400, detail="Invalid company_id")
    query = text(
        """
        SELECT * FROM public.headerview
        WHERE "Company ID" = :company_id
    """
    )

    try:
        df = pd.read_sql(query, engine, params={"company_id": company_id})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    if df.empty:
        return {}

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


@app.get("/v1/spending/supplier/direct/{company_id}", tags=["Spending Views"])
def get_supplier_spend_with_dates(
    company_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: UserDetails = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not company_id or company_id == "undefined":
        raise HTTPException(status_code=400, detail="Invalid company_id")

    # Base query
    query = """
    SELECT 
        po."CompanyDetailsID" AS "Company ID",
        v."VendorName",
        ROUND(SUM((po."OrderQuantity" * po."NetPrice"))::numeric, 2) AS "Total Spend"
    FROM "PurchaseOrder" po
    JOIN "Vendor" v ON (po."VendorID"::text = v."VendorID"::text)
    WHERE po."CompanyDetailsID" = :company_id
    """

    # Convert date strings to date objects if provided
    params = {"company_id": company_id}

    if start_date:
        try:
            start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
            query += ' AND po."DocumentDate" >= :start_date'
            params["start_date"] = start_date_obj
        except ValueError:
            raise HTTPException(
                status_code=400, detail="Invalid start_date format. Use YYYY-MM-DD"
            )

    if end_date:
        try:
            end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date()
            query += ' AND po."DocumentDate" <= :end_date'
            params["end_date"] = end_date_obj
        except ValueError:
            raise HTTPException(
                status_code=400, detail="Invalid end_date format. Use YYYY-MM-DD"
            )

    # Complete the query
    query += ' GROUP BY po."CompanyDetailsID", v."VendorName"'

    try:
        result = db.execute(text(query), params)
        data = [dict(row) for row in result.mappings()]
        data.sort(key=lambda d: d["Total Spend"], reverse=True)
        return {"supplier_spend": data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# api to get spending by supplier
@app.get("/v1/spending/supplier/{company_id}", tags=["Spending Views"])
def supplier_spend(
    company_id: str, current_user: UserDetails = Depends(get_current_active_user)
):
    query = text(
        """
        SELECT * FROM public.supplierview
        WHERE "Company ID" = :company_id
    """
    )

    try:
        df = pd.read_sql(query, engine, params={"company_id": company_id})
        return {"supplier_spend": df.to_dict(orient="records")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/v1/spending/month/direct/{company_id}", tags=["Spending Views"])
def get_month_spend_with_dates(
    company_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: UserDetails = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not company_id or company_id == "undefined":
        raise HTTPException(status_code=400, detail="Invalid company_id")
    # Base query matching the view's logic exactly
    query = """
    SELECT 
        po."CompanyDetailsID" AS "Company ID",
        to_char(po."DocumentDate"::timestamp with time zone, 'Month YYYY') AS "Month Year",
        ROUND(SUM(po."NetPrice" * po."OrderQuantity")::numeric, 2) AS "Total Spend",
        date_trunc('month', po."DocumentDate"::timestamp with time zone) AS month_date
    FROM "PurchaseOrder" po
    WHERE po."CompanyDetailsID" = :company_id
    """

    # Convert date strings to date objects if provided
    params = {"company_id": company_id}

    if start_date:
        try:
            start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
            query += ' AND po."DocumentDate" >= :start_date'
            params["start_date"] = start_date_obj
        except ValueError:
            raise HTTPException(
                status_code=400, detail="Invalid start_date format. Use YYYY-MM-DD"
            )

    if end_date:
        try:
            end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date()
            query += ' AND po."DocumentDate" <= :end_date'
            params["end_date"] = end_date_obj
        except ValueError:
            raise HTTPException(
                status_code=400, detail="Invalid end_date format. Use YYYY-MM-DD"
            )

    # Complete the query to match the view's GROUP BY and ORDER BY
    query += """
    GROUP BY 
        po."CompanyDetailsID", 
        to_char(po."DocumentDate"::timestamp with time zone, 'Month YYYY'),
        date_trunc('month', po."DocumentDate"::timestamp with time zone)
    ORDER BY 
        po."CompanyDetailsID", 
        date_trunc('month', po."DocumentDate"::timestamp with time zone)
    """

    try:
        result = db.execute(text(query), params)
        # Convert to list of dicts and remove the technical month_date field
        data = [
            {
                "Company ID": row["Company ID"],
                "Month Year": row["Month Year"],
                "Total Spend": row["Total Spend"],
            }
            for row in result.mappings()
        ]
        return {"month_spend": data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# api to get spending by month
@app.get("/v1/spending/month/{company_id}", tags=["Spending Views"])
def month_spend(
    company_id: str, current_user: UserDetails = Depends(get_current_active_user)
):
    query = text(
        """
        SELECT * FROM public.monthspend
        WHERE "Company ID" = :company_id
    """
    )

    try:
        df = pd.read_sql(query, engine, params={"company_id": company_id})
        return {"month_spend": df.to_dict(orient="records")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/v1/spending/commodity/direct/{company_id}", tags=["Spending Views"])
def get_commodity_spend_with_dates(
    company_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: UserDetails = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not company_id or company_id == "undefined":
        raise HTTPException(status_code=400, detail="Invalid company_id")
    # Base CTE for total spend calculation
    query = """
    WITH totalspend AS (
        SELECT 
            po."CompanyDetailsID",
            SUM(po."NetPrice" * po."OrderQuantity") AS "TotalSpend"
        FROM "PurchaseOrder" po
        WHERE po."CompanyDetailsID" = :company_id
    """

    params = {"company_id": company_id}

    # Add date filters to totalspend CTE if provided
    if start_date:
        try:
            start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
            query += ' AND po."DocumentDate" >= :start_date'
            params["start_date"] = start_date_obj
        except ValueError:
            raise HTTPException(
                status_code=400, detail="Invalid start_date format. Use YYYY-MM-DD"
            )

    if end_date:
        try:
            end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date()
            query += ' AND po."DocumentDate" <= :end_date'
            params["end_date"] = end_date_obj
        except ValueError:
            raise HTTPException(
                status_code=400, detail="Invalid end_date format. Use YYYY-MM-DD"
            )

    # Continue with commodityspend CTE
    query += """
        GROUP BY po."CompanyDetailsID"
    ),
    commodityspend AS (
        SELECT 
            po."CompanyDetailsID",
            c."CommodityName",
            SUM(po."NetPrice" * po."OrderQuantity") AS "CommoditySpend"
        FROM "PurchaseOrder" po
        JOIN "Commodity" c ON po."CommodityID"::text = c."CommodityID"::text
        WHERE po."CompanyDetailsID" = :company_id
    """

    # Add same date filters to commodityspend CTE
    if start_date:
        query += ' AND po."DocumentDate" >= :start_date'
    if end_date:
        query += ' AND po."DocumentDate" <= :end_date'

    # Final query construction
    query += """
        GROUP BY po."CompanyDetailsID", c."CommodityName"
    )
    SELECT 
        cs."CompanyDetailsID",
        cs."CommodityName",
        ROUND((cs."CommoditySpend" / ts."TotalSpend" * 100::double precision)::numeric, 2) AS "Percentage of Total Spending",
        ROUND(cs."CommoditySpend"::numeric, 2) AS "Total Spend"
    FROM commodityspend cs
    JOIN totalspend ts ON cs."CompanyDetailsID"::text = ts."CompanyDetailsID"::text
    ORDER BY cs."CommodityName"
    """

    try:
        result = db.execute(text(query), params)
        data = [dict(row) for row in result.mappings()]
        return {"commodity_spend": data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


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
    df = pd.read_sql(query, engine).to_dict(orient="records")
    return {"commodity_spend": df}


@app.get("/v1/spending/location/direct/{company_id}", tags=["Spending Views"])
def get_location_spend_with_dates(
    company_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: UserDetails = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not company_id or company_id == "undefined":
        raise HTTPException(status_code=400, detail="Invalid company_id")
    # Base query matching the view's logic exactly
    query = """
    SELECT 
        po."CompanyDetailsID" AS "Company ID",
        v."VendorName",
        v."Country",
        ROUND(SUM(po."NetPrice" * po."OrderQuantity")::numeric, 2) AS "Total Spend"
    FROM "PurchaseOrder" po
    JOIN "Vendor" v ON po."VendorID"::text = v."VendorID"::text
    WHERE po."CompanyDetailsID" = :company_id
    """

    # Convert date strings to date objects if provided
    params = {"company_id": company_id}

    if start_date:
        try:
            start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
            query += ' AND po."DocumentDate" >= :start_date'
            params["start_date"] = start_date_obj
        except ValueError:
            raise HTTPException(
                status_code=400, detail="Invalid start_date format. Use YYYY-MM-DD"
            )

    if end_date:
        try:
            end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date()
            query += ' AND po."DocumentDate" <= :end_date'
            params["end_date"] = end_date_obj
        except ValueError:
            raise HTTPException(
                status_code=400, detail="Invalid end_date format. Use YYYY-MM-DD"
            )

    # Complete the query to match the view's GROUP BY
    query += """
    GROUP BY 
        po."CompanyDetailsID", 
        v."VendorName", 
        v."Country"
    """

    try:
        result = db.execute(text(query), params)
        data = [dict(row) for row in result.mappings()]
        return {"location_spend": data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


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
    df = pd.read_sql(query, engine).to_dict(orient="records")
    return {"location_spend": df}


@app.get(
    "/v1/spending/top_supplier/direct/{company_id}",
    tags=["Spending Views"],
    response_model=PaginatedResponse,
)
def get_top_supplier_spend_with_dates(
    company_id: str,
    skip: int = 0,
    limit: int = 10,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: UserDetails = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not company_id or company_id == "undefined":
        raise HTTPException(status_code=400, detail="Invalid company_id")
    # Validate pagination parameters
    if skip < 0:
        raise HTTPException(
            status_code=400, detail="skip parameter must be greater than or equal to 0"
        )
    if limit < 1 or limit > 100:
        raise HTTPException(
            status_code=400, detail="limit parameter must be between 1 and 100"
        )

    # Base query matching the view's logic
    query = """
    SELECT 
        po."CompanyDetailsID" AS "Company ID",
        c."CommodityName",
        c."PartNumber" AS "MaterialNumber",
        v."VendorName",
        v."Location",
        ROUND(SUM(po."NetPrice" * po."OrderQuantity")::numeric, 2) AS "TotalSpend"
    FROM "PurchaseOrder" po
    JOIN "Commodity" c ON po."CommodityID"::text = c."CommodityID"::text
    JOIN "Vendor" v ON po."VendorID"::text = v."VendorID"::text
    WHERE po."CompanyDetailsID" = :company_id
    """

    params = {"company_id": company_id}

    # Add date filters if provided
    if start_date:
        try:
            start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
            query += ' AND po."DocumentDate" >= :start_date'
            params["start_date"] = start_date_obj
        except ValueError:
            raise HTTPException(
                status_code=400, detail="Invalid start_date format. Use YYYY-MM-DD"
            )

    if end_date:
        try:
            end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date()
            query += ' AND po."DocumentDate" <= :end_date'
            params["end_date"] = end_date_obj
        except ValueError:
            raise HTTPException(
                status_code=400, detail="Invalid end_date format. Use YYYY-MM-DD"
            )

    # Complete the query with GROUP BY and ORDER BY
    query += """
    GROUP BY 
        po."CompanyDetailsID", 
        c."CommodityName", 
        c."PartNumber", 
        v."VendorName", 
        v."Location"
    ORDER BY "TotalSpend" DESC
    LIMIT :limit OFFSET :skip
    """

    # Total count query (without pagination)
    total_query = """
    SELECT COUNT(*) FROM (
        SELECT 
            po."CompanyDetailsID"
        FROM "PurchaseOrder" po
        JOIN "Commodity" c ON po."CommodityID"::text = c."CommodityID"::text
        JOIN "Vendor" v ON po."VendorID"::text = v."VendorID"::text
        WHERE po."CompanyDetailsID" = :company_id
    """

    # Add same date filters to count query
    if start_date:
        total_query += ' AND po."DocumentDate" >= :start_date'
    if end_date:
        total_query += ' AND po."DocumentDate" <= :end_date'

    total_query += """
        GROUP BY 
            po."CompanyDetailsID", 
            c."CommodityName", 
            c."PartNumber", 
            v."VendorName", 
            v."Location"
    ) AS subquery
    """

    try:
        # Execute both queries
        params.update({"limit": limit, "skip": skip})

        # Get paginated results
        result = db.execute(text(query), params)
        items = [dict(row) for row in result.mappings()]

        # Get total count
        total_result = db.execute(text(total_query), params)
        total = total_result.scalar()

        return PaginatedResponse(total=total, items=items)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


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
    df = pd.read_sql(query, engine)
    total = pd.read_sql(total_query, engine).iloc[0, 0]

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
    # Check if currency already exists
    currency = (
        db.query(CurrencyDetails)
        .filter(CurrencyDetails.Currency == company.Currency.Currency)
        .first()
    )

    # If currency doesn't exist, create it
    if not currency:
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


@app.get(
    "/v1/company_details",
    response_model=List[CompanyDetailsInfoSchema],
    tags=["Company Details"],
)
def get_companies(
    company_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_user),
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
    db.commit()

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
    db.commit()

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


# Fixed subscription details
MONTHLY_SUBSCRIPTION_AMOUNT = 3199.00  # ₹3199 per month
SUBSCRIPTION_CURRENCY = "INR"
SUBSCRIPTION_DESCRIPTION = "Detmo Monthly Subscription"


@app.post("/v1/payments/subscribe", tags=["Payments"])
async def create_subscription(
    subscription: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_user),
):
    """
    Create a monthly subscription where:
    - current_user is the payer
    - beneficiary_id is who gets the subscription benefits
    """

    # Authorization check
    company_user = ensure_company_user_relation(
        db, user_id=current_user.ClerkID, company_id=current_user.CompanyDetailsID
    )
    db.commit()
    if company_user.RoleID != ADMIN_ROLE_ID:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    try:
        # Verify beneficiary exists
        beneficiary = (
            db.query(UserDetails)
            .filter(UserDetails.ClerkID == subscription.beneficiary_id)
            .first()
        )
        if not beneficiary:
            raise HTTPException(status_code=404, detail="Beneficiary user not found")

        # Check if beneficiary already has an active subscription
        existing_sub = (
            db.query(PaymentSubscription)
            .filter(
                PaymentSubscription.BeneficiaryID == subscription.beneficiary_id,
                PaymentSubscription.Status.in_(["active", "pending"]),
            )
            .first()
        )
        if existing_sub:
            if existing_sub.Status == "pending":
                return {
                    "subscription": existing_sub,
                    "currency": subscription.currency,
                }

            raise HTTPException(
                status_code=400, detail="Beneficiary already has an active subscription"
            )

        # Create customer in Razorpay for payer
        razorpay_customer_id = None
        if current_user.Email:
            try:
                customers = razorpay_client.customer.all({"email": current_user.Email})
                if customers["count"] > 0:
                    razorpay_customer_id = customers["items"][0]["id"]
                else:
                    customer = razorpay_client.customer.create(
                        {
                            "name": current_user.UserName or "Customer",
                            "email": current_user.Email,
                            "notes": {"clerk_id": current_user.ClerkID},
                        }
                    )
                    razorpay_customer_id = customer["id"]
            except Exception as e:
                logger.error(f"Error creating Razorpay customer: {str(e)}")

        plan_id = os.getenv("SUBSCRIPTION_PLAN_ID", "")
        try:
            expire_by = int(
                (datetime.now(timezone.utc) + timedelta(hours=24)).timestamp()
            )
        except Exception as e:
            print(f"Error calculating timestamp: {e}")
            expire_by = int(datetime.now(timezone.utc).timestamp()) + 86400

        # Create subscription in Razorpay
        razorpay_subscription = razorpay_client.subscription.create(
            {
                "plan_id": plan_id if plan_id != "" else "plan_QuVYrS2WgFKSL7",
                "customer_notify": 1,
                "total_count": 100,
                "expire_by": expire_by,
                "customer_id": razorpay_customer_id,
                "notes": {
                    "payer_id": current_user.ClerkID,
                    "beneficiary_id": subscription.beneficiary_id,
                },
            }
        )

        # Save to database
        db_subscription = PaymentSubscription(
            PayerID=current_user.ClerkID,
            BeneficiaryID=subscription.beneficiary_id,
            RazorpaySubscriptionID=razorpay_subscription["id"],
            RazorpayCustomerID=razorpay_customer_id,
            Status="pending",
            CreatedAt=datetime.utcnow(),
        )
        db.add(db_subscription)
        db.commit()
        db.refresh(db_subscription)

        # Return the subscription details and payment link
        return {
            "subscription": db_subscription,
            "currency": subscription.currency,
            "payment_page_url": razorpay_subscription.get("short_url"),
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


async def update_beneficiary_status(db: Session, beneficiary_id: str, is_paid: bool):
    """Helper function to update beneficiary status and sync with Clerk"""
    beneficiary = (
        db.query(UserDetails).filter(UserDetails.ClerkID == beneficiary_id).first()
    )
    if beneficiary:
        beneficiary.IsPaid = is_paid
        company_user = ensure_company_user_relation(
            db=db, user_id=beneficiary.ClerkID, company_id=beneficiary.CompanyDetailsID
        )
        sync_clerk_user_metadata(user=beneficiary, company_user=company_user)


@app.post("/v1/payments/webhook", tags=["Payments"])
async def handle_payment_webhook(
    request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)
):
    try:
        # Verify the webhook signature
        webhook_secret = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")
        if not webhook_secret:
            logger.error("Webhook secret missing from environment")
            raise HTTPException(status_code=500, detail="Webhook secret not configured")

        received_signature = request.headers.get("X-Razorpay-Signature")
        if not received_signature:
            logger.warning("Missing signature header in webhook")
            raise HTTPException(status_code=400, detail="Missing signature header")

        body = await request.body()
        expected_signature = hmac.new(
            webhook_secret.encode(), body, hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(received_signature, expected_signature):
            logger.warning(f"Invalid signature received: {received_signature}")
            raise HTTPException(status_code=400, detail="Invalid signature")

        payload = await request.json()
        event = payload.get("event")
        if not event:
            logger.warning("Webhook missing event type")
            raise HTTPException(status_code=400, detail="Missing event type")

        logger.info(f"Received {event} webhook")

        # --- ASYNC PROCESSING ---
        # Pass the raw request body to background task
        background_tasks.add_task(
            process_webhook_background,
            body=body,  # Pass the raw body for security re-check
            event_type=event,
            payload=payload,
            signature=received_signature,
        )

        return {"status": "accepted"}

    except Exception as e:
        logger.error(f"Error processing payment webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Background task with proper DB session handling
@retry(**RETRY_CONFIG)
async def process_webhook_background(
    body: bytes, event_type: str, payload: dict, signature: str
):
    """Background task with fresh database session"""
    # Get fresh database session
    db = next(get_db())

    try:
        # 1. Re-verify signature in background task
        webhook_secret = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")
        if not webhook_secret:
            raise ValueError("Webhook secret not configured")

        # Generate expected signature
        expected_signature = hmac.new(
            webhook_secret.encode(), body, hashlib.sha256
        ).hexdigest()

        # SECURITY CRITICAL: Actual comparison
        if not hmac.compare_digest(signature, expected_signature):
            raise ValueError("Invalid webhook signature")

        # Process the event
        if "subscription" in payload.get("payload", {}):
            await handle_subscription_event(db, payload, event_type)

        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Background processing failed: {str(e)}", exc_info=True)
        raise
    finally:
        db.close()


async def handle_subscription_event(db: Session, payload: dict, event: str):
    """Handle subscription events with proper transaction management"""
    subscription_id = payload["payload"]["subscription"]["entity"]["id"]
    subscription = (
        db.query(PaymentSubscription)
        .filter(PaymentSubscription.RazorpaySubscriptionID == subscription_id)
        .first()
    )

    if not subscription:
        logger.error(f"Subscription not found: {subscription_id}")
        return

    subscription_data = payload["payload"]["subscription"]["entity"]
    logger.info(f"Processing {event} for subscription {subscription_id}")

    if event == "subscription.activated":
        subscription.Status = "active"
        subscription.StartDate = datetime.fromtimestamp(subscription_data["start_at"])
        subscription.EndDate = datetime.fromtimestamp(subscription_data["end_at"])
    elif event == "subscription.pending":
        subscription.Status = "pending"
    elif event in [
        "subscription.cancelled",
        "subscription.completed",
        "subscription.halted",
    ]:
        beneficiary_id = subscription.BeneficiaryID
        db.delete(subscription)
        logger.info(f"Deleted {event} subscription {subscription_id}")
        await update_beneficiary_status(db, beneficiary_id, False)
    elif event == "subscription.paused":
        subscription.Status = "pending"
        await update_beneficiary_status(db, subscription.BeneficiaryID, False)
    elif event == "subscription.resumed":
        subscription.Status = "active"
        await update_beneficiary_status(db, subscription.BeneficiaryID, True)
    elif event == "subscription.charged":
        subscription.Status = "active"
        await handle_subscription_payment(db, payload, subscription)


async def handle_subscription_payment(
    db: Session, payload: dict, subscription: PaymentSubscription
):
    """Record payment and update subscription"""
    payment_data = payload["payload"]["payment"]["entity"]

    db_payment = PaymentDetails(
        SubscriptionID=subscription.SubscriptionID,
        RazorpayPaymentID=payment_data["id"],
        Amount=payment_data["amount"] / 100,
        Currency=payment_data["currency"],
        Status=payment_data["status"],
        Method=payment_data["method"],
        InvoiceID=payment_data.get("invoice_id"),
        Description=SUBSCRIPTION_DESCRIPTION,
        CreatedAt=datetime.fromtimestamp(payment_data["created_at"]),
    )
    db.add(db_payment)

    if "charge_at" in payload["payload"]["subscription"]["entity"]:
        subscription.NextBillingDate = datetime.fromtimestamp(
            payload["payload"]["subscription"]["entity"]["charge_at"]
        )

    logger.info(
        f"Recorded payment {payment_data['id']} for {subscription.RazorpaySubscriptionID}"
    )
    await update_beneficiary_status(db, subscription.BeneficiaryID, True)


@app.get(
    "/v1/payments/subscriptions/me",
    response_model=List[SubscriptionResponse],
    tags=["Payments"],
)
async def get_my_subscriptions(
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_user),
):
    """Get subscriptions where current user is either payer or beneficiary"""
    subscriptions = (
        db.query(PaymentSubscription)
        .options(joinedload(PaymentSubscription.Beneficiary))  # Eager load beneficiary
        .filter(
            PaymentSubscription.PayerID == current_user.ClerkID,
            PaymentSubscription.Status.in_(["active", "pending"]),
        )
        .order_by(PaymentSubscription.CreatedAt.desc())
        .all()
    )

    return [
        {
            **sub.__dict__,
            "BeneficiaryEmail": sub.Beneficiary.Email if sub.Beneficiary else None,
        }
        for sub in subscriptions
    ]


@app.post("/v1/payments/subscriptions/{subscription_id}/cancel", tags=["Payments"])
async def cancel_subscription(
    subscription_id: str,
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_user),
):
    """Only the payer can cancel a subscription"""
    subscription = (
        db.query(PaymentSubscription)
        .filter(
            PaymentSubscription.SubscriptionID == subscription_id,
            PaymentSubscription.PayerID
            == current_user.ClerkID,  # Only payer can cancel
        )
        .first()
    )

    if not subscription:
        raise HTTPException(
            status_code=404, detail="Subscription not found or not authorized to cancel"
        )

    if subscription.Status in ["cancelled", "expired"]:
        raise HTTPException(status_code=400, detail="Subscription already cancelled")

    # Cancel in Razorpay
    try:
        razorpay_client.subscription.cancel(subscription.RazorpaySubscriptionID)
        subscription.Status = "cancelled"

        # Update beneficiary's paid status
        beneficiary = (
            db.query(UserDetails)
            .filter(UserDetails.ClerkID == subscription.BeneficiaryID)
            .first()
        )
        if beneficiary:
            beneficiary.IsPaid = False
            company_user = ensure_company_user_relation(
                db=db,
                user_id=beneficiary.ClerkID,
                company_id=beneficiary.CompanyDetailsID,
            )
            sync_clerk_user_metadata(user=beneficiary, company_user=company_user)

        db.delete(subscription)
        db.commit()

        return {"status": "success", "message": "Subscription cancelled"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/v1/my-referrals", response_model=List[dict])
async def get_my_referrals(
    time_period: str = "all",  # "all", "30d", "90d", "year"
    db: Session = Depends(get_db),
    current_user: UserDetails = Depends(get_current_user),
):
    """
    Get list of users who signed up using current user's referral code
    Returns: List of referrals with stats
    """
    # Calculate time filter
    now = datetime.utcnow()
    time_filters = {
        "30d": now - timedelta(days=30),
        "90d": now - timedelta(days=90),
        "year": now - timedelta(days=365),
        "all": None,
    }

    if time_period not in time_filters:
        raise HTTPException(status_code=400, detail="Invalid time period")

    # Base query
    query = db.query(Referral).filter(Referral.ReferrerID == current_user.ClerkID)

    # Apply time filter if needed
    if time_period != "all":
        query = query.filter(Referral.CreatedAt >= time_filters[time_period])

    referrals = query.order_by(Referral.CreatedAt.desc()).all()

    # Format response
    result = {
        "total": len(referrals),
        "referrals": [
            {
                "referee_id": r.RefereeID,
                "created_at": r.CreatedAt.isoformat(),
            }
            for r in referrals
        ],
    }

    return result
