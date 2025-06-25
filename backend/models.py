from enum import Enum
from pydantic import BaseModel
from sqlalchemy.orm import registry
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String , Float , Date 
from sqlalchemy.orm import relationship
from database import Base
from typing import List
import uuid
from datetime import datetime
import os


mapper_registry = registry()
mapper_registry.configure()





class UserDetails(Base):
    __tablename__ = 'User'
    ClerkID = Column(String(255), primary_key=True, index=True)
    UserName = Column(String(255), nullable=True)
    Email = Column(String(255), unique=True, index=True, nullable=False)
    Password = Column(String(255), nullable=True)
    RoleID = Column(String(36), ForeignKey('RoleDetails.RoleID'))
    CompanyDetailsID = Column(String(36), ForeignKey('CompanyDetails.CompanyDetailsID'))
    
    Comments = relationship("CommentDetails", back_populates="User")
    Role = relationship("RoleDetails", back_populates="Users")
    CompanyDetails = relationship("CompanyDetailsInfo", back_populates="Users")
    Projects = relationship("ProjectUsersDetails", back_populates="User")
    
 

class RoleDetails(Base):
    __tablename__ = 'RoleDetails'
    RoleID = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    UserRole = Column(String(50), nullable=False)

    Users = relationship("UserDetails", back_populates="Role")

class CurrencyDetails(Base):
    __tablename__ = "Currency"
    CurrencyID = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    Currency = Column(String(50), nullable=False)

    CompanyDetails = relationship("CompanyDetailsInfo", back_populates="Currency", cascade="all, delete-orphan")

class CompanyDetailsInfo(Base):
    __tablename__ = "CompanyDetails"
    CompanyDetailsID = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
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

    Vendor = relationship("VendorDetails", back_populates="CompanyDetails", cascade="all, delete-orphan")
    Commodity = relationship("CommodityDetails", back_populates="CompanyDetails", cascade="all, delete-orphan")
    MaterialGroup = relationship("MaterialGroupDetails", back_populates="CompanyDetails", cascade="all, delete-orphan")
    PurchaseOrder = relationship("PurchaseOrderDetails", back_populates="CompanyDetails", cascade="all, delete-orphan")
    SourcingProjects = relationship("SourcingProjectDetails", back_populates="CompanyDetails", cascade="all, delete-orphan")
    Users = relationship("UserDetails", back_populates="CompanyDetails", cascade="all, delete-orphan")
    SupplierEvaluations = relationship("SupplierEvaluationDetails", back_populates="CompanyDetails", cascade="all, delete-orphan")
    Comments = relationship("CommentDetails", back_populates="CompanyDetails", cascade="all, delete-orphan")
    Billings = relationship("BillingDetails", back_populates="CompanyDetails")
    CurrencyID = Column(String(36), ForeignKey('Currency.CurrencyID'))
    Currency = relationship("CurrencyDetails", back_populates="CompanyDetails")

class PurchaseOrderDetails(Base):
    __tablename__ = "PurchaseOrder"
    PurchaseOrderID = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    OrderQuantity = Column(Float, nullable=False)
    NetPrice = Column(Float, nullable=False)
    ToBeDeliveredQty = Column(Float, nullable=False)
    DocumentDate = Column(Date, nullable=False)

    CompanyDetailsID = Column(String(36), ForeignKey('CompanyDetails.CompanyDetailsID'))
    CompanyDetails = relationship("CompanyDetailsInfo", back_populates="PurchaseOrder")

    CommodityID = Column(String(36), ForeignKey('Commodity.CommodityID'))
    Commodity = relationship("CommodityDetails", back_populates="PurchaseOrder")

    VendorID = Column(String(36), ForeignKey('Vendor.VendorID'))
    Vendor = relationship("VendorDetails", back_populates="PurchaseOrder")

    MaterialGroupID = Column(String(36), ForeignKey('MaterialGroup.MaterialGroupID'))
    MaterialGroup = relationship("MaterialGroupDetails", back_populates="PurchaseOrder")

class VendorDetails(Base):
    __tablename__ = "Vendor"
    VendorID = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    VendorName = Column(String(255), nullable=False)
    Location = Column(String(255), nullable=False)
    Country = Column(String(100), nullable=False)

    PurchaseOrder = relationship("PurchaseOrderDetails", back_populates="Vendor", cascade="all, delete-orphan")

    CompanyDetailsID = Column(String(36), ForeignKey('CompanyDetails.CompanyDetailsID'))
    CompanyDetails = relationship("CompanyDetailsInfo", back_populates="Vendor")


    
class MaterialGroupDetails(Base):
    __tablename__ = "MaterialGroup"
    MaterialGroupID = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    MaterialGroupNumber = Column(String(50), nullable=False)
    MaterialGroupDescription = Column(String(255), nullable=False)

    PurchaseOrder = relationship("PurchaseOrderDetails", back_populates="MaterialGroup", cascade="all, delete-orphan")

    CompanyDetailsID = Column(String(36), ForeignKey('CompanyDetails.CompanyDetailsID'))
    CompanyDetails = relationship("CompanyDetailsInfo", back_populates="MaterialGroup")

class CommodityDetails(Base):
    __tablename__ = "Commodity"
    CommodityID = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    CommodityName = Column(String(255), nullable=False)
    AffectedProduct = Column(String(255))
    PartNumber = Column(String(100))
    PartDescription = Column(String(255))

    PurchaseOrder = relationship("PurchaseOrderDetails", back_populates="Commodity", cascade="all, delete-orphan")
    SourcingProjects = relationship("SourcingProjectDetails", back_populates="Commodity", cascade="all, delete-orphan")

    CompanyDetailsID = Column(String(36), ForeignKey('CompanyDetails.CompanyDetailsID'))
    CompanyDetails = relationship("CompanyDetailsInfo", back_populates="Commodity")

class SourcingProjectDetails(Base):
    __tablename__ = "SourcingProject"
    SourcingProjectID = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
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

    SupplierEvaluations = relationship("SupplierEvaluationDetails", back_populates="SourcingProject")
    Comments = relationship("CommentDetails", back_populates="SourcingProject")

    CompanyDetailsID = Column(String(36), ForeignKey('CompanyDetails.CompanyDetailsID'))
    CompanyDetails = relationship("CompanyDetailsInfo", back_populates="SourcingProjects")

    CommodityID = Column(String(36), ForeignKey('Commodity.CommodityID'))
    Commodity = relationship("CommodityDetails", back_populates="SourcingProjects")
    Users = relationship("ProjectUsersDetails", back_populates="SourcingProject")
    

class SupplierEvaluationDetails(Base):
    __tablename__ = "SupplierEvaluation"
    SupplierEvaluationID = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
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

    CompanyDetailsID = Column(String(36), ForeignKey('CompanyDetails.CompanyDetailsID'))
    CompanyDetails = relationship("CompanyDetailsInfo", back_populates="SupplierEvaluations")

    SourcingProjectID = Column(String(36), ForeignKey('SourcingProject.SourcingProjectID'))
    SourcingProject = relationship("SourcingProjectDetails", back_populates="SupplierEvaluations")


class CommentDetails(Base):
    __tablename__ = "Comment"
    CommentID = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    Comment = Column(String(255), nullable=False)
    CommentDate = Column(Date, nullable=False)
   
    CompanyDetailsID = Column(String(36), ForeignKey('CompanyDetails.CompanyDetailsID'))
    CompanyDetails = relationship("CompanyDetailsInfo", back_populates="Comments")

    SourcingProjectID = Column(String(36), ForeignKey('SourcingProject.SourcingProjectID'))
    SourcingProject = relationship("SourcingProjectDetails", back_populates="Comments")

    ClerkID = Column(String(255), ForeignKey('User.ClerkID'))
    User = relationship("UserDetails", back_populates="Comments")


class ProjectUsersDetails(Base):
    __tablename__ = 'ProjectUsers'
    ClerkID = Column(String(255), ForeignKey('User.ClerkID'), primary_key=True)
    SourcingProjectID = Column(String(36), ForeignKey('SourcingProject.SourcingProjectID'), primary_key=True)
    
    User = relationship("UserDetails", back_populates="Projects")
    SourcingProject = relationship("SourcingProjectDetails", back_populates="Users")

class BillingDetails(Base):
    __tablename__ = "Billing"
    BillingID = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    BillingDate = Column(Date, nullable=False)
    Description = Column(String(255), nullable=False)
    Amount = Column(Float, nullable=False)
    Status = Column(String(36),nullable=False)
    PaymentPlan = Column(String(255), nullable=False)
    PaymentMethod = Column(String(255),nullable=False)

    CompanyDetailsID = Column(String(36), ForeignKey('CompanyDetails.CompanyDetailsID'))
    CompanyDetails = relationship("CompanyDetailsInfo", back_populates="Billings")

    # CompanyDetailsInfo.Billings = relationship("BillingDetails", order_by=BillingDetails.BillingID, back_populates="CompanyDetails")