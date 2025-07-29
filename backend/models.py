import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import registry, relationship

from database import Base

mapper_registry = registry()
mapper_registry.configure()


class UserDetails(Base):
    __tablename__ = "User"
    ClerkID = Column(String(255), primary_key=True, index=True)
    UserName = Column(String(255), nullable=True)
    Email = Column(String(255), unique=True, index=True, nullable=False)
    Password = Column(String(255), nullable=True)
    RoleID = Column(String(36), ForeignKey("RoleDetails.RoleID"))
    CompanyDetailsID = Column(String(36), ForeignKey("CompanyDetails.CompanyDetailsID"))
    DefaultCompanyDetailsID = Column(
        String(36), ForeignKey("CompanyDetails.CompanyDetailsID"), nullable=False
    )
    IsPaid = Column(Boolean, default=False, nullable=False)

    Comments = relationship("CommentDetails", back_populates="User")
    Role = relationship("RoleDetails", back_populates="Users")

    CompanyDetails = relationship(
        "CompanyDetailsInfo", foreign_keys=[CompanyDetailsID], back_populates="Users"
    )
    DefaultCompany = relationship(
        "CompanyDetailsInfo",
        foreign_keys=[DefaultCompanyDetailsID],
        back_populates="DefaultUser",
    )

    Projects = relationship("ProjectUsersDetails", back_populates="User")
    CompanyLinks = relationship(
        "CompanyUser", back_populates="User", cascade="all, delete-orphan"
    )

    SubscriptionsPaid = relationship(
        "PaymentSubscription",
        foreign_keys="[PaymentSubscription.PayerID]",
        back_populates="Payer",
    )
    SubscriptionsReceived = relationship(
        "PaymentSubscription",
        foreign_keys="[PaymentSubscription.BeneficiaryID]",
        back_populates="Beneficiary",
    )

    # New relationships for referrals
    ReferralsMade = relationship(
        "Referral",
        foreign_keys="[Referral.ReferrerID]",
        back_populates="Referrer",
        cascade="all, delete-orphan",
    )

    ReferralReceived = relationship(
        "Referral",
        foreign_keys="[Referral.RefereeID]",
        back_populates="Referee",
        uselist=False,
    )


class RoleDetails(Base):
    __tablename__ = "RoleDetails"
    RoleID = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    UserRole = Column(String(50), nullable=False)

    Users = relationship("UserDetails", back_populates="Role")
    CompanyUsers = relationship("CompanyUser", back_populates="Role")


class CurrencyDetails(Base):
    __tablename__ = "Currency"
    CurrencyID = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    Currency = Column(String(50), nullable=False)

    CompanyDetails = relationship(
        "CompanyDetailsInfo", back_populates="Currency", cascade="all, delete-orphan"
    )


class CompanyDetailsInfo(Base):
    __tablename__ = "CompanyDetails"
    CompanyDetailsID = Column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True
    )
    DisplayName = Column(String(255), nullable=False)
    PhoneNumber = Column(String(20))
    Email = Column(String(255), nullable=False)
    LegalName = Column(String(255), nullable=False)
    RegistrationNumber = Column(String(50), nullable=False)
    VatNumber = Column(String(50), nullable=False)
    Address = Column(String(255), nullable=False)
    City = Column(String(100), nullable=False)
    Country = Column(String(100), nullable=False)
    Zip = Column(String(20), nullable=False)

    Vendor = relationship(
        "VendorDetails", back_populates="CompanyDetails", cascade="all, delete-orphan"
    )
    Commodity = relationship(
        "CommodityDetails",
        back_populates="CompanyDetails",
        cascade="all, delete-orphan",
    )
    MaterialGroup = relationship(
        "MaterialGroupDetails",
        back_populates="CompanyDetails",
        cascade="all, delete-orphan",
    )
    PurchaseOrder = relationship(
        "PurchaseOrderDetails",
        back_populates="CompanyDetails",
        cascade="all, delete-orphan",
    )
    SourcingProjects = relationship(
        "SourcingProjectDetails",
        back_populates="CompanyDetails",
        cascade="all, delete-orphan",
    )

    Users = relationship(
        "UserDetails",
        foreign_keys="[UserDetails.CompanyDetailsID]",
        back_populates="CompanyDetails",
        cascade="all, delete-orphan",
    )

    # One-to-one: one default user per company
    DefaultUser = relationship(
        "UserDetails",
        foreign_keys="[UserDetails.DefaultCompanyDetailsID]",
        back_populates="DefaultCompany",
        uselist=False,
    )

    SupplierEvaluations = relationship(
        "SupplierEvaluationDetails",
        back_populates="CompanyDetails",
        cascade="all, delete-orphan",
    )
    Comments = relationship(
        "CommentDetails", back_populates="CompanyDetails", cascade="all, delete-orphan"
    )
    Billings = relationship("BillingDetails", back_populates="CompanyDetails")
    CurrencyID = Column(String(36), ForeignKey("Currency.CurrencyID"))
    Currency = relationship("CurrencyDetails", back_populates="CompanyDetails")
    UserLinks = relationship(
        "CompanyUser", back_populates="Company", cascade="all, delete-orphan"
    )


class CompanyUser(Base):
    __tablename__ = "CompanyUser"
    ID = Column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True
    )

    UserID = Column(String(255), ForeignKey("User.ClerkID"), index=True)
    CompanyID = Column(
        String(36), ForeignKey("CompanyDetails.CompanyDetailsID"), index=True
    )
    RoleID = Column(String(36), ForeignKey("RoleDetails.RoleID"))

    User = relationship("UserDetails", back_populates="CompanyLinks")
    Company = relationship("CompanyDetailsInfo", back_populates="UserLinks")
    Role = relationship("RoleDetails", back_populates="CompanyUsers")

    __table_args__ = (UniqueConstraint("UserID", "CompanyID", name="uq_user_company"),)


class PurchaseOrderDetails(Base):
    __tablename__ = "PurchaseOrder"
    PurchaseOrderID = Column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    OrderQuantity = Column(Float, nullable=False, index=True)
    NetPrice = Column(Float, nullable=False, index=True)
    ToBeDeliveredQty = Column(Float, nullable=False, index=True)
    DocumentDate = Column(Date, nullable=False, index=True)

    CompanyDetailsID = Column(
        String(36), ForeignKey("CompanyDetails.CompanyDetailsID"), index=True
    )
    CompanyDetails = relationship("CompanyDetailsInfo", back_populates="PurchaseOrder")

    CommodityID = Column(String(36), ForeignKey("Commodity.CommodityID"), index=True)
    Commodity = relationship(
        "CommodityDetails", back_populates="PurchaseOrder", lazy="selectin"
    )

    VendorID = Column(String(36), ForeignKey("Vendor.VendorID"), index=True)
    Vendor = relationship(
        "VendorDetails", back_populates="PurchaseOrder", lazy="joined"
    )

    MaterialGroupID = Column(
        String(36), ForeignKey("MaterialGroup.MaterialGroupID"), index=True
    )
    MaterialGroup = relationship("MaterialGroupDetails", back_populates="PurchaseOrder")

    __table_args__ = (
        # Composite index for common query pattern
        Index("idx_po_company_commodity", "CompanyDetailsID", "CommodityID"),
        # Another composite index
        Index("idx_po_vendor_date", "VendorID", "DocumentDate"),
    )


class VendorDetails(Base):
    __tablename__ = "Vendor"
    VendorID = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    VendorName = Column(String(255), nullable=False, index=True)
    Location = Column(String(255), nullable=False, index=True)
    Country = Column(String(100), nullable=False, index=True)

    PurchaseOrder = relationship(
        "PurchaseOrderDetails", back_populates="Vendor", cascade="all, delete-orphan"
    )

    CompanyDetailsID = Column(
        String(36), ForeignKey("CompanyDetails.CompanyDetailsID"), index=True
    )
    CompanyDetails = relationship("CompanyDetailsInfo", back_populates="Vendor")


class MaterialGroupDetails(Base):
    __tablename__ = "MaterialGroup"
    MaterialGroupID = Column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    MaterialGroupNumber = Column(String(50), nullable=False, index=True)
    MaterialGroupDescription = Column(String(255), nullable=False, index=True)

    PurchaseOrder = relationship(
        "PurchaseOrderDetails",
        back_populates="MaterialGroup",
        cascade="all, delete-orphan",
    )

    CompanyDetailsID = Column(
        String(36), ForeignKey("CompanyDetails.CompanyDetailsID"), index=True
    )
    CompanyDetails = relationship("CompanyDetailsInfo", back_populates="MaterialGroup")


class CommodityDetails(Base):
    __tablename__ = "Commodity"
    CommodityID = Column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    CommodityName = Column(String(255), nullable=False, index=True)
    AffectedProduct = Column(String(255))
    PartNumber = Column(String(100), index=True)
    PartDescription = Column(String(255))

    PurchaseOrder = relationship(
        "PurchaseOrderDetails", back_populates="Commodity", cascade="all, delete-orphan"
    )
    SourcingProjects = relationship(
        "SourcingProjectDetails",
        back_populates="Commodity",
        cascade="all, delete-orphan",
    )

    CompanyDetailsID = Column(
        String(36), ForeignKey("CompanyDetails.CompanyDetailsID"), index=True
    )
    CompanyDetails = relationship("CompanyDetailsInfo", back_populates="Commodity")


class SourcingProjectDetails(Base):
    __tablename__ = "SourcingProject"
    SourcingProjectID = Column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    Name = Column(String(255), nullable=False)
    Objective = Column(String(255))
    Saving = Column(Float, nullable=False)
    ProjectType = Column(String(100))
    StartDate = Column(Date, nullable=False)
    EndDate = Column(Date)
    Phase = Column(String(50))
    Status = Column(String(50))
    SourcingPmEmail = Column(String(255))
    ScmManagerEmail = Column(String(255))
    SelectedSupplierPmEmail = Column(String(255))
    BuyerEmail = Column(String(255))
    ProjectSponserEmail = Column(String(255))
    FinancePocEmail = Column(String(255))
    ProjectInterval = Column(String(50))

    SupplierEvaluations = relationship(
        "SupplierEvaluationDetails", back_populates="SourcingProject"
    )
    Comments = relationship("CommentDetails", back_populates="SourcingProject")

    CompanyDetailsID = Column(String(36), ForeignKey("CompanyDetails.CompanyDetailsID"))
    CompanyDetails = relationship(
        "CompanyDetailsInfo", back_populates="SourcingProjects"
    )

    CommodityID = Column(String(36), ForeignKey("Commodity.CommodityID"))
    Commodity = relationship("CommodityDetails", back_populates="SourcingProjects")
    Users = relationship("ProjectUsersDetails", back_populates="SourcingProject")


class SupplierEvaluationDetails(Base):
    __tablename__ = "SupplierEvaluation"
    SupplierEvaluationID = Column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    SupplierName = Column(String(255), nullable=False)
    CompanySizeRank = Column(Integer, nullable=False)
    CriticalPartsRank = Column(Integer, nullable=False)
    NonCriticalPartsRank = Column(Integer, nullable=False)
    RevenueRank = Column(Integer, nullable=False)
    OnTimeDeliveryRank = Column(Integer, nullable=False)
    SupplierHealthRank = Column(Integer, nullable=False)
    AvgAnnualRAndDSpentRank = Column(Integer, nullable=False)
    OrderFulfilmentRateRank = Column(Integer, nullable=False)
    LocationRank = Column(Integer, nullable=False)
    RankingTotalResult = Column(Float, nullable=False)

    CompanyDetailsID = Column(String(36), ForeignKey("CompanyDetails.CompanyDetailsID"))
    CompanyDetails = relationship(
        "CompanyDetailsInfo", back_populates="SupplierEvaluations"
    )

    SourcingProjectID = Column(
        String(36), ForeignKey("SourcingProject.SourcingProjectID")
    )
    SourcingProject = relationship(
        "SourcingProjectDetails", back_populates="SupplierEvaluations"
    )


class CommentDetails(Base):
    __tablename__ = "Comment"
    CommentID = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    Comment = Column(String(255), nullable=False)
    CommentDate = Column(Date, nullable=False)

    CompanyDetailsID = Column(String(36), ForeignKey("CompanyDetails.CompanyDetailsID"))
    CompanyDetails = relationship("CompanyDetailsInfo", back_populates="Comments")

    SourcingProjectID = Column(
        String(36), ForeignKey("SourcingProject.SourcingProjectID")
    )
    SourcingProject = relationship("SourcingProjectDetails", back_populates="Comments")

    ClerkID = Column(String(255), ForeignKey("User.ClerkID"))
    User = relationship("UserDetails", back_populates="Comments")


class ProjectUsersDetails(Base):
    __tablename__ = "ProjectUsers"
    ClerkID = Column(String(255), ForeignKey("User.ClerkID"), primary_key=True)
    SourcingProjectID = Column(
        String(36), ForeignKey("SourcingProject.SourcingProjectID"), primary_key=True
    )

    User = relationship("UserDetails", back_populates="Projects")
    SourcingProject = relationship("SourcingProjectDetails", back_populates="Users")


class BillingDetails(Base):
    __tablename__ = "Billing"
    BillingID = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    BillingDate = Column(Date, nullable=False)
    Description = Column(String(255), nullable=False)
    Amount = Column(Float, nullable=False)
    Status = Column(String(36), nullable=False)
    PaymentPlan = Column(String(255), nullable=False)
    PaymentMethod = Column(String(255), nullable=False)

    CompanyDetailsID = Column(String(36), ForeignKey("CompanyDetails.CompanyDetailsID"))
    CompanyDetails = relationship("CompanyDetailsInfo", back_populates="Billings")

    # CompanyDetailsInfo.Billings = relationship("BillingDetails", order_by=BillingDetails.BillingID, back_populates="CompanyDetails")


class PaymentSubscription(Base):
    __tablename__ = "PaymentSubscriptions"

    SubscriptionID = Column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    PayerID = Column(
        String(255), ForeignKey("User.ClerkID"), index=True
    )  # Who is paying
    BeneficiaryID = Column(
        String(255), ForeignKey("User.ClerkID"), index=True, unique=True
    )  # Who benefits
    RazorpaySubscriptionID = Column(String(100))
    RazorpayCustomerID = Column(String(100))
    Status = Column(
        String(50), default="created"
    )  # created, active, paused, cancelled, expired
    StartDate = Column(DateTime, nullable=True)
    EndDate = Column(DateTime, nullable=True)
    NextBillingDate = Column(DateTime)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    UpdatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    Payer = relationship(
        "UserDetails", foreign_keys=[PayerID], back_populates="SubscriptionsPaid"
    )
    Beneficiary = relationship(
        "UserDetails",
        foreign_keys=[BeneficiaryID],
        back_populates="SubscriptionsReceived",
    )
    Payments = relationship(
        "PaymentDetails", back_populates="Subscription", cascade="all, delete-orphan"
    )


class PaymentDetails(Base):
    __tablename__ = "Payments"

    PaymentID = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    SubscriptionID = Column(
        String(36), ForeignKey("PaymentSubscriptions.SubscriptionID")
    )
    RazorpayPaymentID = Column(String(100))
    Amount = Column(Float, nullable=False)
    Currency = Column(String(10), default="INR")
    Status = Column(String(50))  # created, authorized, captured, refunded, failed
    Method = Column(String(50))  # payment method
    InvoiceID = Column(String(100))
    Description = Column(String(255))
    CreatedAt = Column(DateTime, default=datetime.utcnow)

    Subscription = relationship("PaymentSubscription", back_populates="Payments")


class Referral(Base):
    __tablename__ = "referrals"

    ReferralID = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ReferrerID = Column(
        String, ForeignKey("User.ClerkID"), index=True, nullable=False
    )  # ClerkID of referrer
    RefereeID = Column(
        String, ForeignKey("User.ClerkID"), index=True, nullable=False
    )  # ClerkID of referred user
    CreatedAt = Column(DateTime, default=datetime.utcnow)

    Referrer = relationship(
        "UserDetails", foreign_keys=[ReferrerID], back_populates="ReferralsMade"
    )

    Referee = relationship(
        "UserDetails",
        foreign_keys=[RefereeID],
        back_populates="ReferralReceived",  # Singular (one-to-one)
        uselist=False,  # Ensures a single referral (not a list)
    )
