from sqlalchemy import Column, Integer, String, Date, Text
from .db import Base


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


