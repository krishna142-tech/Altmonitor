from sqlalchemy import Column, Integer, String, Date, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .db import Base
from datetime import datetime


class CovenantEntry(Base):
    __tablename__ = "covenant_entries"

    id = Column(Integer, primary_key=True)
    calc_date = Column(Date, nullable=False)
    covenant_name = Column(String(255), nullable=False)
    threshold = Column(String(128))
    borrower_calc = Column(String(128))
    lender_calc = Column(String(128))
    consequence = Column(String(255))
    compliance_check = Column(String(64))
    comment = Column(Text)
    source_file = Column(String(255))
    reference_file = Column(String(255))
    pdf_path = Column(String(512))

    def to_dict(self):
        return {
            "id": self.id,
            "calc_date": self.calc_date.isoformat() if self.calc_date else None,
            "covenant_name": self.covenant_name,
            "threshold": self.threshold,
            "borrower_calc": self.borrower_calc,
            "lender_calc": self.lender_calc,
            "consequence": self.consequence,
            "compliance_check": self.compliance_check,
            "comment": self.comment,
            "source_file": self.source_file,
            "reference_file": self.reference_file,
            "pdf_path": self.pdf_path,
        }



# New models for portfolio-scoped covenant tracking

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True)
    portfolio_id = Column(String(128), nullable=False)
    filename = Column(String(255), nullable=False)
    path = Column(String(512), nullable=False)
    doc_type = Column(String(32), nullable=False)  # pdf | excel
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "portfolio_id": self.portfolio_id,
            "filename": self.filename,
            "path": self.path,
            "doc_type": self.doc_type,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
        }


class CovenantTemplate(Base):
    __tablename__ = "covenant_templates"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "description": self.description}


class CovenantPeriod(Base):
    __tablename__ = "covenant_periods"

    id = Column(Integer, primary_key=True)
    portfolio_id = Column(String(128), nullable=False)
    ipd_date = Column(Date, nullable=False)
    display_name = Column(String(64), nullable=False)  # e.g., Mar-2025
    template_status = Column(String(32), default="Draft")  # Draft | Approved
    source = Column(String(32), default="Provisional")  # Actuals | Provisional
    is_provisional = Column(Boolean, default=True)
    provisional_start_date = Column(Date)
    report_link = Column(String(512))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    entries = relationship("CovenantEntryV2", back_populates="period", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "portfolio_id": self.portfolio_id,
            "ipd_date": self.ipd_date.isoformat() if self.ipd_date else None,
            "display_name": self.display_name,
            "template_status": self.template_status,
            "source": self.source,
            "is_provisional": self.is_provisional,
            "provisional_start_date": self.provisional_start_date.isoformat() if self.provisional_start_date else None,
            "report_link": self.report_link,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class CovenantEntryV2(Base):
    __tablename__ = "covenant_entries_v2"

    id = Column(Integer, primary_key=True)
    period_id = Column(Integer, ForeignKey("covenant_periods.id"), nullable=False)
    covenant_name = Column(String(255), nullable=False)
    threshold = Column(String(128))
    borrower_calc = Column(String(128))
    lender_calc = Column(String(128))
    consequence = Column(String(255))
    compliance_check = Column(String(64))
    comment = Column(Text)
    source_file = Column(String(255))
    reference_file = Column(String(255))
    document_id = Column(Integer, ForeignKey("documents.id"))

    period = relationship("CovenantPeriod", back_populates="entries")
    document = relationship("Document")

    def to_dict(self):
        return {
            "id": self.id,
            "period_id": self.period_id,
            "covenant_name": self.covenant_name,
            "threshold": self.threshold,
            "borrower_calc": self.borrower_calc,
            "lender_calc": self.lender_calc,
            "consequence": self.consequence,
            "compliance_check": self.compliance_check,
            "comment": self.comment,
            "source_file": self.source_file,
            "reference_file": self.reference_file,
            "document_id": self.document_id,
        }

