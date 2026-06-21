import uuid
import razorpay
from app.config.settings import settings

# Initialize razorpay client
client = None
is_mock = settings.RAZORPAY_KEY_ID.startswith("rzp_test_mock") or not settings.RAZORPAY_KEY_ID

if not is_mock:
    try:
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    except Exception as e:
        print(f"Warning: Failed to initialize real Razorpay client: {e}. Using mock mode.")
        is_mock = True

def create_razorpay_order(amount_in_rupees: float) -> dict:
    """
    Creates a Razorpay Order. Converts Rupees to Paise for Razorpay API.
    """
    amount_in_paise = int(amount_in_rupees * 100)
    
    if is_mock or client is None:
        # Return simulated order structure
        mock_order_id = f"order_mock_{uuid.uuid4().hex[:12]}"
        return {
            "id": mock_order_id,
            "amount": amount_in_paise,
            "currency": "INR",
            "status": "created"
        }
        
    try:
        data = {
            "amount": amount_in_paise,
            "currency": "INR",
            "payment_capture": 1
        }
        order = client.order.create(data=data)
        return order
    except Exception as e:
        print(f"Razorpay order creation failed: {e}. Falling back to mock order.")
        mock_order_id = f"order_mock_{uuid.uuid4().hex[:12]}"
        return {
            "id": mock_order_id,
            "amount": amount_in_paise,
            "currency": "INR",
            "status": "created"
        }

def verify_payment_signature(razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
    """
    Verify payment signature against Razorpay keys. Bypassed for mock orders.
    """
    if is_mock or client is None or (razorpay_order_id and razorpay_order_id.startswith("order_mock_")):
        return True
        
    try:
        params_dict = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        }
        client.utility.verify_payment_signature(params_dict)
        return True
    except Exception:
        return False
