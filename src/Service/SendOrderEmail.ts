import emailjs from "@emailjs/browser";

export const sendOrderEmail = async ({
                                         email,
                                         phone,
                                         customerName,
                                         items,
                                         total,
                                     }: {
    email: string;
    phone: string;
    customerName: string;
    items: { name: string; price: number; imageUrl: string }[];
    total: number;
}) => {
    const serviceId = "service_e73ntpk";
    const templateId = "template_p2lbja5";
    const publicKey = "GXrFvYajjt1gmn3_a";

    const templateParams = {
        email,
        CustomerName: customerName,
        phone,
        cost: {
            total: total.toFixed(2),
        },
        orders: items.map((item) => ({
            name: item.name,
            price: item.price.toFixed(2),
            image_url: item.imageUrl,
        })),
    };

    try {
        await emailjs.send(serviceId, templateId, templateParams, publicKey);
        console.log("✅ Email sent!");
    } catch (error) {
        console.error("❌ Failed to send email:", error);
    }
};
