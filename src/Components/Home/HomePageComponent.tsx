import { useState } from "react";
import { Container, Typography, Button, Card, CardContent } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
    const navigate = useNavigate();
    const [showInfo, setShowInfo] = useState<boolean>(false);

    return (
        <Container className="home-container">
            <Typography variant="h3" className="home-title"> AviApp - ברוך הבא ל</Typography>
            <Typography variant="h5" className="home-subtitle">ניהול הזמנות, משתמשים ועסק במקום אחד</Typography>

            <div className="button-container">
                <Button
                    variant="contained"
                    className="green-button"
                    onClick={() => navigate("/create-orders")}
                >
                    ➕ הוספת הזמנה
                </Button>

                <Button
                    variant="contained"
                    className="yellow-button"
                    onClick={() => navigate("/menuitems")}
                >
                    🍽️ הצגת תפריט
                </Button>

                <Button
                    variant="contained"
                    className="blue-button"
                    onClick={() => setShowInfo(!showInfo)}
                >
                    ℹ️ מידע על האתר
                </Button>
            </div>

            {showInfo && (
                <Card className="info-card">
                    <CardContent>
                        <Typography variant="h6">ℹ️ AviApp על  </Typography>
                        <Typography variant="body2" className="info-text">
                             זו מערכת מתקדמת לניהול הזמנות ולקוחות.
                            בעזרת האפליקציה תוכלו לנהל תפריטים, להזמין מוצרים ולעקוב אחר ביצועי העסק.
                            המערכת מתאימה למסעדות, בתי קפה ועסקים אחרים הדורשים מעקב אחרי הזמנות ולקוחות.
                            ניתן להוסיף ולהסיר מוצרים מהתפריט, לצפות בהיסטוריית ההזמנות ולנהל משתמשים עם הרשאות שונות.
                            הכל מנוהל בצורה ידידותית ופשוטה, עם דגש על חוויית משתמש נוחה ומאובטחת.
                            הפלטפורמה מתאימה גם למנהלים וגם ללקוחות, עם ממשק קל לשימוש.
                        </Typography>

                    </CardContent>
                </Card>
            )}
        </Container>
    );
};

export default HomePage;
