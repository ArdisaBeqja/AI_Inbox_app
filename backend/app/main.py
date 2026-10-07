from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title='AI Inbox Assistant API', version='0.1.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

class Email(BaseModel):
    id: int
    sender: str
    subject: str
    body: str
    category: str
    priority: str
    summary: str
    action: str
    status: str = 'needs_reply'

class DraftRequest(BaseModel):
    email_id: int

class DraftResponse(BaseModel):
    email_id: int
    draft: str

EMAILS: List[Email] = [
    Email(
        id=1,
        sender='Sarah Miller <sarah@example.com>',
        subject='Order #1234 has not arrived',
        body='Hi, I ordered product #1234 last week but it still has not arrived. Can you check the shipping status for me?',
        category='Shipping problem',
        priority='High',
        summary='Customer has not received order #1234 and is asking for a shipping update.',
        action='Check shipment status and reply with an update.',
    ),
    Email(
        id=2,
        sender='Mark Jensen <mark@example.com>',
        subject='Invoice copy needed',
        body='Hello, could you please send me another copy of invoice INV-8821? Thank you.',
        category='Invoice',
        priority='Medium',
        summary='Customer requests a copy of invoice INV-8821.',
        action='Locate the invoice and attach it to the reply.',
    ),
    Email(
        id=3,
        sender='Emma Rossi <emma@example.com>',
        subject='Can I move my appointment?',
        body='Hi, I have an appointment tomorrow at 14:00. Is it possible to move it to Friday afternoon?',
        category='Booking',
        priority='High',
        summary='Customer wants to reschedule tomorrow\'s appointment to Friday afternoon.',
        action='Check Friday availability and offer a new time.',
    ),
    Email(
        id=4,
        sender='David Lee <david@example.com>',
        subject='Question about refund policy',
        body='Hi, I purchased an item 10 days ago. Can I still return it for a refund?',
        category='Refund question',
        priority='Medium',
        summary='Customer asks whether a 10-day-old purchase is still eligible for a refund.',
        action='Reply with the company refund policy.',
    ),
]

DRAFTS = {
    1: "Hi Sarah,\n\nThanks for reaching out. I’m sorry your order has not arrived yet. I’ll check the shipment status for order #1234 and send you an update as soon as possible.\n\nBest regards,\nSupport Team",
    2: "Hi Mark,\n\nOf course. I’ll send you another copy of invoice INV-8821. Please let me know if you need anything else.\n\nBest regards,\nSupport Team",
    3: "Hi Emma,\n\nThanks for letting us know. I’ll check our availability for Friday afternoon and confirm a suitable time with you shortly.\n\nBest regards,\nSupport Team",
    4: "Hi David,\n\nThanks for contacting us. I’ll check your purchase against our refund policy and confirm whether the item is eligible for return.\n\nBest regards,\nSupport Team",
}

@app.get('/health')
def health():
    return {'status': 'ok'}

@app.get('/emails', response_model=List[Email])
def get_emails():
    return EMAILS

@app.get('/emails/{email_id}', response_model=Email)
def get_email(email_id: int):
    for email in EMAILS:
        if email.id == email_id:
            return email
    raise HTTPException(status_code=404, detail='Email not found')

@app.post('/draft', response_model=DraftResponse)
def create_draft(request: DraftRequest):
    if request.email_id not in DRAFTS:
        raise HTTPException(status_code=404, detail='Email not found')
    return DraftResponse(email_id=request.email_id, draft=DRAFTS[request.email_id])

@app.post('/emails/{email_id}/mark-done', response_model=Email)
def mark_done(email_id: int):
    for email in EMAILS:
        if email.id == email_id:
            email.status = 'done'
            return email
    raise HTTPException(status_code=404, detail='Email not found')
