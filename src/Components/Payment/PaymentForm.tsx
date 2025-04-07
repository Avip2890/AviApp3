import { useState } from "react";
import { TextField, Button, CircularProgress, Typography, Paper } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import "./PaymentForm.css";

const formatCardNumber = (value: string) => {
    return value
        .replace(/\D/g, "")
        .slice(0, 16)
        .replace(/(\d{4})/g, "$1-")
        .replace(/-$/, "");
};

const formatExpiryDate = (value: string) => {
    return value
        .replace(/\D/g, "")
        .slice(0, 4)
        .replace(/^(\d{2})(\d{0,2})/, "$1/$2")
        .slice(0, 5);
};

const formatCVV = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 3);
};

const PaymentForm = ({ onPaymentSuccess }: { onPaymentSuccess: () => void }) => {
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePayment = () => {
        if (!cardNumber || !expiry || !cvv) {
            setError("⚠️ יש למלא את כל השדות");
            return;
        }

        setError(null);
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            // לאחר אישור התשלום, מנקים את השדות
            setCardNumber("");
            setExpiry("");
            setCvv("");
            // ממתינים כמה שניות לפני שהמערכת שולחת את ההצלחה
            setTimeout(() => {
                setSuccess(false);
                onPaymentSuccess(); // קריאה לפונקציה כאשר התשלום הצליח
            }, 2000);
        }, 3000); // זמן המתנה לדימוי תהליך התשלום
    };

    return (
        <Paper className="payment-form" elevation={3}>
            <Typography variant="h6">💳 פרטי תשלום</Typography>

            {success ? (
                <div className="payment-success">
                    <CheckCircleIcon style={{ color: "green", fontSize: 50 }} />
                    <Typography variant="h6" color="green">
                        ✅ התשלום הצליח!
                    </Typography>
                </div>
            ) : (
                <>
                    <TextField
                        label="מספר כרטיס אשראי"
                        variant="outlined"
                        fullWidth
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        margin="normal"
                        className="payment-input"
                        placeholder="XXXX-XXXX-XXXX-XXXX"
                    />
                    <TextField
                        label="תוקף (MM/YY)"
                        variant="outlined"
                        fullWidth
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiryDate(e.target.value))}
                        margin="normal"
                        className="payment-input"
                        placeholder="MM/YY"
                    />
                    <TextField
                        label="CVV"
                        variant="outlined"
                        fullWidth
                        type="password"
                        value={cvv}
                        onChange={(e) => setCvv(formatCVV(e.target.value))}
                        margin="normal"
                        className="payment-input"
                        placeholder="XXX"
                    />
                    {error && <Typography color="error">{error}</Typography>}

                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handlePayment}
                        disabled={loading}
                        className="payment-button"
                    >
                        {loading ? <CircularProgress size={24} /> : "שלם"}
                    </Button>
                </>
            )}
        </Paper>
    );
};

export default PaymentForm;
