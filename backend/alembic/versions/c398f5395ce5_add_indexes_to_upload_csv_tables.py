"""add indexes to upload csv tables

Revision ID: c398f5395ce5
Revises: e4665d580d8d
Create Date: 2025-07-30 00:30:17.991535

"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "c398f5395ce5"
down_revision: Union[str, None] = "e4665d580d8d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_index(
        op.f("ix_Commodity_CommodityName"), "Commodity", ["CommodityName"], unique=False
    )
    op.create_index(
        op.f("ix_Commodity_CompanyDetailsID"),
        "Commodity",
        ["CompanyDetailsID"],
        unique=False,
    )
    op.create_index(
        op.f("ix_Commodity_PartNumber"), "Commodity", ["PartNumber"], unique=False
    )
    op.create_index(
        op.f("ix_CompanyDetails_CompanyDetailsID"),
        "CompanyDetails",
        ["CompanyDetailsID"],
        unique=False,
    )
    op.create_index(
        op.f("ix_MaterialGroup_CompanyDetailsID"),
        "MaterialGroup",
        ["CompanyDetailsID"],
        unique=False,
    )
    op.create_index(
        op.f("ix_MaterialGroup_MaterialGroupDescription"),
        "MaterialGroup",
        ["MaterialGroupDescription"],
        unique=False,
    )
    op.create_index(
        op.f("ix_MaterialGroup_MaterialGroupNumber"),
        "MaterialGroup",
        ["MaterialGroupNumber"],
        unique=False,
    )
    op.create_index(
        "idx_po_company_commodity",
        "PurchaseOrder",
        ["CompanyDetailsID", "CommodityID"],
        unique=False,
    )
    op.create_index(
        "idx_po_vendor_date",
        "PurchaseOrder",
        ["VendorID", "DocumentDate"],
        unique=False,
    )
    op.create_index(
        op.f("ix_PurchaseOrder_CommodityID"),
        "PurchaseOrder",
        ["CommodityID"],
        unique=False,
    )
    op.create_index(
        op.f("ix_PurchaseOrder_CompanyDetailsID"),
        "PurchaseOrder",
        ["CompanyDetailsID"],
        unique=False,
    )
    op.create_index(
        op.f("ix_PurchaseOrder_DocumentDate"),
        "PurchaseOrder",
        ["DocumentDate"],
        unique=False,
    )
    op.create_index(
        op.f("ix_PurchaseOrder_MaterialGroupID"),
        "PurchaseOrder",
        ["MaterialGroupID"],
        unique=False,
    )
    op.create_index(
        op.f("ix_PurchaseOrder_NetPrice"), "PurchaseOrder", ["NetPrice"], unique=False
    )
    op.create_index(
        op.f("ix_PurchaseOrder_OrderQuantity"),
        "PurchaseOrder",
        ["OrderQuantity"],
        unique=False,
    )
    op.create_index(
        op.f("ix_PurchaseOrder_ToBeDeliveredQty"),
        "PurchaseOrder",
        ["ToBeDeliveredQty"],
        unique=False,
    )
    op.create_index(
        op.f("ix_PurchaseOrder_VendorID"), "PurchaseOrder", ["VendorID"], unique=False
    )
    op.create_index(
        op.f("ix_Vendor_CompanyDetailsID"), "Vendor", ["CompanyDetailsID"], unique=False
    )
    op.create_index(op.f("ix_Vendor_Country"), "Vendor", ["Country"], unique=False)
    op.create_index(op.f("ix_Vendor_Location"), "Vendor", ["Location"], unique=False)
    op.create_index(
        op.f("ix_Vendor_VendorName"), "Vendor", ["VendorName"], unique=False
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f("ix_Vendor_VendorName"), table_name="Vendor")
    op.drop_index(op.f("ix_Vendor_Location"), table_name="Vendor")
    op.drop_index(op.f("ix_Vendor_Country"), table_name="Vendor")
    op.drop_index(op.f("ix_Vendor_CompanyDetailsID"), table_name="Vendor")
    op.drop_index(op.f("ix_PurchaseOrder_VendorID"), table_name="PurchaseOrder")
    op.drop_index(op.f("ix_PurchaseOrder_ToBeDeliveredQty"), table_name="PurchaseOrder")
    op.drop_index(op.f("ix_PurchaseOrder_OrderQuantity"), table_name="PurchaseOrder")
    op.drop_index(op.f("ix_PurchaseOrder_NetPrice"), table_name="PurchaseOrder")
    op.drop_index(op.f("ix_PurchaseOrder_MaterialGroupID"), table_name="PurchaseOrder")
    op.drop_index(op.f("ix_PurchaseOrder_DocumentDate"), table_name="PurchaseOrder")
    op.drop_index(op.f("ix_PurchaseOrder_CompanyDetailsID"), table_name="PurchaseOrder")
    op.drop_index(op.f("ix_PurchaseOrder_CommodityID"), table_name="PurchaseOrder")
    op.drop_index("idx_po_vendor_date", table_name="PurchaseOrder")
    op.drop_index("idx_po_company_commodity", table_name="PurchaseOrder")
    op.drop_index(
        op.f("ix_MaterialGroup_MaterialGroupNumber"), table_name="MaterialGroup"
    )
    op.drop_index(
        op.f("ix_MaterialGroup_MaterialGroupDescription"), table_name="MaterialGroup"
    )
    op.drop_index(op.f("ix_MaterialGroup_CompanyDetailsID"), table_name="MaterialGroup")
    op.drop_index(
        op.f("ix_CompanyDetails_CompanyDetailsID"), table_name="CompanyDetails"
    )
    op.drop_index(op.f("ix_Commodity_PartNumber"), table_name="Commodity")
    op.drop_index(op.f("ix_Commodity_CompanyDetailsID"), table_name="Commodity")
    op.drop_index(op.f("ix_Commodity_CommodityName"), table_name="Commodity")
    # ### end Alembic commands ###
