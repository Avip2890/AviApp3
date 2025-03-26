import  { useState } from "react";
import axios from "axios";
import {
    Box, TextField, Card, CardMedia, CircularProgress, Typography
} from "@mui/material";

interface UnsplashImagePickerProps {
    onSelect: (imageUrl: string) => void;
}

function UnsplashImagePicker({ onSelect }: UnsplashImagePickerProps) {
    const [query, setQuery] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const UNSPLASH_ACCESS_KEY = "Jnx9dFc6WLmG907U5u0hTTWONjEAQOXvHCBG8yDzq3A";

    interface UnsplashImage {
        id: string;
        urls: {
            small: string;
            full: string;
            regular: string;
            thumb: string;
        };
    }

    const searchImages = async (searchTerm: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<{ results: UnsplashImage[] }>("https://api.unsplash.com/search/photos", {
                params: { query: searchTerm, per_page: 9 },
                headers: {
                    Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
                },
            });

            const urls = response.data.results.map((img) => img.urls.small);
            setImages(urls);
        } catch (err) {
            setError(err + "❌ שגיאה בטעינת תמונות מ־Unsplash");
        } finally {
            setLoading(false);
        }
    };


    return (
        <Box>
            <TextField
                label="🔎 חפש תמונה ב-Unsplash"
                fullWidth
                variant="outlined"
                margin="normal"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        searchImages(query);
                    }
                }}
            />


            {loading && <CircularProgress />}
            {error && <Typography color="error">{error}</Typography>}

            <Box display="flex" flexWrap="wrap" gap={2} className="unsplash-grid">
                {images.map((url, index) => (
                    <Box
                        key={index}
                        width="30%"
                        className="unsplash-card"
                        onClick={() => onSelect(url)}
                        sx={{ cursor: "pointer" }}
                    >
                        <Card>
                            <CardMedia component="img" height="140" image={url} />
                        </Card>
                    </Box>
                ))}
            </Box>

        </Box>
    );
}

export default UnsplashImagePicker;
