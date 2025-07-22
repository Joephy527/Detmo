from datetime import date, datetime
from typing import Generic, List, Optional, TypeVar

from pydantic import BaseModel, EmailStr, Field
from pydantic.generics import GenericModel


class RoleResponse(BaseModel):
    UserRole: str

    class Config:
        orm_mode = True
        from_attributes = True


class UserWithRoleResponse(BaseModel):
    ClerkID: str
    UserName: Optional[str]
    Email: str
    Role: str
    RoleID: str
    Subscription: Optional[dict]


class UserListResponse(BaseModel):
    items: List[UserWithRoleResponse]


class UserResponse(BaseModel):
    ClerkID: str = Field(..., example="123e4567-e89b-12d3-a456-426614174001")
    UserName: str = Field(..., example="John Doe")
    Email: str = Field(..., example="johndoe@example.com")
    RoleID: str = Field(..., example="123e4567-e89b-12d3-a456-426614174002")
    CompanyDetailsID: Optional[str] = Field(
        ..., example="123e4567-e89b-12d3-a456-426614174003"
    )

    Role: Optional[RoleResponse]

    class Config:
        orm_mode = True
        from_attributes = (
            True  # This line enables the from_orm method to work correctly
        )


# Reusable pagination function
T = TypeVar("T")


class PaginatedResponse(GenericModel, Generic[T]):
    total: int
    items: List[T]

    class Config:
        orm_mode = True
        from_attributes = (
            True  # This line enables the from_orm method to work correctly
        )


class SourcingProjectCreate(BaseModel):
    Name: str
    Objective: str
    ProjectType: str
    Saving: float
    StartDate: Optional[date]
    EndDate: Optional[date]
    Phase: str
    Status: str
    SourcingPmEmail: Optional[EmailStr]
    ScmManagerEmail: Optional[EmailStr]
    SelectedSupplierPmEmail: Optional[EmailStr]
    BuyerEmail: Optional[EmailStr]
    ProjectSponserEmail: Optional[EmailStr]
    FinancePocEmail: Optional[EmailStr]
    ProjectInterval: Optional[EmailStr]

    CommodityName: str
    CommodityAffectedProduct: str
    CommodityPartNumber: str
    CommodityPartDescription: str


class SourcingProjectUpdate(BaseModel):
    Name: Optional[str]
    Objective: Optional[str]
    Saving: Optional[float]
    ProjectType: Optional[str]
    StartDate: Optional[date]
    EndDate: Optional[date]
    Phase: Optional[str]
    Status: Optional[str]
    SourcingPmEmail: Optional[EmailStr]
    ScmManagerEmail: Optional[EmailStr]
    SelectedSupplierPmEmail: Optional[EmailStr]
    BuyerEmail: Optional[EmailStr]
    ProjectSponserEmail: Optional[EmailStr]
    FinancePocEmail: Optional[EmailStr]
    ProjectInterval: Optional[str]
    CommodityName: Optional[str]
    CommodityAffectedProduct: Optional[str]
    CommodityPartNumber: Optional[str]
    CommodityPartDescription: Optional[str]


class CommodityDetailsResponse(BaseModel):
    CommodityID: str = Field(..., example="841f5124-cd92-49ad-be1c-3807f1ec1f4f")
    CommodityName: str = Field(..., example="Example Commodity")
    AffectedProduct: Optional[str] = Field(None, example="Example Product")
    PartNumber: Optional[str] = Field(None, example="12345")
    PartDescription: Optional[str] = Field(None, example="Example Part Description")

    class Config:
        orm_mode = True
        from_attributes = True


# Example response for documentation

# class CompanyDetailResp(BaseModel):
#     CompanyDetailsID:str
#     Currency:str

#     class Config:
#         orm_mode = True


class SourcingProjectDetailsResponse(BaseModel):
    SourcingProjectID: str = Field(..., example="08046a66-63a8-428a-975a-b73271aab1b7")
    Name: str = Field(..., example="Project Name")
    Objective: Optional[str] = Field(None, example="Project Objective")
    Saving: float = Field(..., example=1000.0)
    ProjectType: Optional[str] = Field(None, example="Type A")
    StartDate: date = Field(..., example=date(2024, 6, 21))
    EndDate: Optional[date] = Field(None, example=date(2024, 8, 1))
    Phase: Optional[str] = Field(None, example="Example Phase")
    Status: Optional[str] = Field(None, example="Example Status")
    SourcingPmEmail: Optional[EmailStr] = Field(None, example="sourcing@example.com")
    ScmManagerEmail: Optional[EmailStr] = Field(None, example="scm@example.com")
    SelectedSupplierPmEmail: Optional[EmailStr] = Field(
        None, example="supplier@example.com"
    )
    BuyerEmail: Optional[EmailStr] = Field(None, example="buyer@example.com")
    ProjectSponserEmail: Optional[EmailStr] = Field(None, example="sponsor@example.com")
    FinancePocEmail: Optional[EmailStr] = Field(None, example="finance@example.com")
    ProjectInterval: Optional[str] = Field(None, example="Interval A")
    CompanyDetailsID: Optional[str] = Field(
        None, example="08046a66-63a8-428a-975a-b73271aab1b7"
    )
    Commodity: CommodityDetailsResponse

    class Config:
        orm_mode = True
        from_attributes = True


class CurrencyDetailsCreate(BaseModel):
    Currency: Optional[str] = Field(..., example="USD")


class CompanyDetailsCreate(BaseModel):
    DisplayName: Optional[str]
    PhoneNumber: Optional[str]
    Email: Optional[EmailStr]
    LegalName: Optional[str]
    RegistrationNumber: Optional[str]
    VatNumber: Optional[str]
    Address: Optional[str]
    City: Optional[str]
    Country: Optional[str]
    Zip: Optional[str]
    Currency: CurrencyDetailsCreate


class CurrencyUpdate(BaseModel):
    Currency: Optional[str]
    CurrencyID: Optional[str]


class CompanyUpdate(BaseModel):
    CompanyDetailsID: Optional[str]
    DisplayName: Optional[str]
    PhoneNumber: Optional[str]
    Email: Optional[str]
    LegalName: Optional[str]
    RegistrationNumber: Optional[str]
    VatNumber: Optional[str]
    Address: Optional[str]
    City: Optional[str]
    Country: Optional[str]
    Zip: Optional[str]
    Currency: Optional[CurrencyUpdate]


class DeleteUserResponse(BaseModel):
    message: str

    class Config:
        schema_extra = {"example": {"message": "User deleted successfully"}}


class CurrencySchema(BaseModel):
    CurrencyID: str = Field(..., example="e82f1b10-f977-4d78-aead-1cdcba7e34cf")
    Currency: str = Field(..., example="USD")

    class Config:
        orm_mode = True


class CompanyDetailsInfoSchema(BaseModel):
    CompanyDetailsID: str = Field(..., example="d3dd7c6c-a6ba-46fc-be40-e6d2ebd6d466")
    DisplayName: str = Field(..., example="Detmo")
    PhoneNumber: Optional[str] = Field(..., example="7856482164")
    Email: str = Field(..., example="detmo@detmo.in")
    LegalName: str = Field(..., example="Detmo")
    RegistrationNumber: str = Field(..., example="Reg2564")
    VatNumber: str = Field(..., example="Vat1235")
    Address: str = Field(..., example="addr")
    City: str = Field(..., example="Mumbai")
    Country: str = Field(..., example="India")
    Zip: str = Field(..., example="847586")
    Currency: Optional[CurrencySchema]

    class Config:
        orm_mode = True


class UpdateUserRoleRequest(BaseModel):
    user_role: str = Field(..., example="admin")


class ClerkUserCreated(BaseModel):
    data: dict
    object: str
    type: str


class HeaderViewResponse(BaseModel):
    CompanyDetailsID: str
    total_spend: float = Field(..., example="7811.16")
    supplier_count: int = Field(..., example="5")
    commodity_count: int = Field(..., example="10")
    location_count: int = Field(..., example="3")
    po_count: int = Field(..., example="4")


class SupplierEvaluationCreate(BaseModel):
    SupplierName: str
    CompanySizeRank: int
    CriticalPartsRank: int
    NonCriticalPartsRank: int
    RevenueRank: int
    OnTimeDeliveryRank: int
    SupplierHealthRank: int
    AvgAnnualRAndDSpentRank: int
    OrderFulfilmentRateRank: int
    LocationRank: int


class SupplierEvaluationUpdate(SupplierEvaluationCreate):
    pass


class SupplierEvaluationResponse(BaseModel):
    SupplierEvaluationID: str = Field(
        ..., example="d3dd7c6c-a6ba-46fc-be40-e6d2ebd6d466"
    )
    SupplierName: str = Field(..., example="Vendor 1")
    CompanySizeRank: int = Field(..., example="4")
    CriticalPartsRank: int = Field(..., example="4")
    NonCriticalPartsRank: int = Field(..., example="4")
    RevenueRank: int = Field(..., example="4")
    OnTimeDeliveryRank: int = Field(..., example="4")
    SupplierHealthRank: int = Field(..., example="4")
    AvgAnnualRAndDSpentRank: int = Field(..., example="4")
    OrderFulfilmentRateRank: int = Field(..., example="4")
    LocationRank: int = Field(..., example="4")
    RankingTotalResult: float = Field(..., example="36")
    CompanyDetailsID: str = Field(..., example="d3dd7c6c-a6ba-46fc-be40-e6d2ebd6d466")
    SourcingProjectID: str = Field(..., example="d3dd7c6c-a6ba-46fc-be40-e6d2ebd6d466")

    class Config:
        orm_mode = True
        from_attributes = True


class CommentCreate(BaseModel):
    Comment: str
    CommentDate: date
    UserID: str


class UserCommentResponse(BaseModel):
    ClerkID: str
    UserName: str


class CommentResponseWithUser(BaseModel):
    CommentID: str
    Comment: str
    CommentDate: date
    CompanyDetailsID: str
    SourcingProjectID: str
    ClerkID: str
    User: UserCommentResponse


class UserProjectLink(BaseModel):
    ClerkID: str
    SourcingProjectID: str


class UserProjectUpdate(BaseModel):
    newClerkID: str = None
    newSourcingProjectID: str = None


class OrderRequest(BaseModel):
    amount: float
    currency: str = "INR"
    receipt: str
    description: str
    payment_plan: str
    payment_method: str
    # company_details_id: str


class PaymentVerification(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class SubscriptionCreate(BaseModel):
    beneficiary_id: str  # Who the subscription is for (can be same as payer)
    amount: float = 3199.00  # Fixed monthly amount
    currency: str = "INR"


class SubscriptionResponse(BaseModel):
    SubscriptionID: str
    PayerID: str
    BeneficiaryID: str
    RazorpaySubscriptionID: str
    Status: str
    StartDate: Optional[datetime]
    EndDate: Optional[datetime]
    NextBillingDate: Optional[datetime]
    CreatedAt: datetime
    UpdatedAt: datetime

    class Config:
        orm_mode = True


class PaymentResponse(BaseModel):
    PaymentID: str
    SubscriptionID: str
    RazorpayPaymentID: str
    Amount: float
    Currency: str
    Status: str
    Method: Optional[str]
    InvoiceID: Optional[str]
    Description: Optional[str]
    CreatedAt: datetime

    class Config:
        orm_mode = True
