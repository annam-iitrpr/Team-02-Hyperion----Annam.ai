// Google Cloud & Firebase Service Account credentials for AASRA (Project: iitm01)
export const GCP_SERVICE_ACCOUNT = {
  type: "service_account",
  project_id: "iitm01",
  private_key_id: "92b2edcd1bd1dbec01f561e309d2d9b6358428d3",
  private_key:
    process.env.GCP_PRIVATE_KEY ||
    "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCcXAXW8RuwJBPX\nI0FWwRDP1vTxeTHXDsSBlVPnWkrHuAOW+zJqRvEStf+RSBqL0hrhjad0wm5TOFXX\nYphXygbG6aa4+UnNaE+CBwyipC6K49yLSdrUNR8bMkE0W1i2BtJhEDEMQCiF7Kj7\nbYbHKx7oVDMk0WieehEOO23S6LVLmXFbBTQ2gXW3qpDHvD4KNMCy+cwN0CjfZnR0\nTWZviHjJk+fpT9/rxG4gGNb21AZahIcJbiY/Shk83N4LPFSYJ/Fp94C8o2KxP6Ci\n0FghJ+oiws7MBXO01CZLulsjVBKYDGFhn2eul3BsrNedC5D+VRhHexOAU5oN5mNU\n316NP6TXAgMBAAECggEAS5zStB1Xyue/cnfZlob5xtCIFigKGppJG/MnJoeLBybt\nEXu7ZxqUZPx/MPYB5GC/4BhdBQErUfI5zNUgn7+SZGnEVsoyzvLlFBetnA8ydLb5\nRaB7AskHmGLGlnegIDKPVSH73hU+o3kNRL00AqfPJAHn06Oy6IRWMCA8HVSsq3gw\ncNb4V2FNaGoMX7hSOxMIest0X5VFKOkbHLB3E+Q5I3N1v7TcGB+rL9eoIBV24gUF\nNe6RKFh2tmdul6map5n+F56ZBaCDPx2l82hcb5O26TbO60j/BmLqr6iRxj8eLo7s\nYa8QLUsSzUzAsJg0rVaY3Lg2hOSnED5N0/7dgwZmgQKBgQDPYLw2Mg9Np9EKCz6c\nJQvvb3gnXCR5oGULNj9nmvhnK+tGtbyzV9Zm6eQmN/eiFyP6PGuS2m3zRy5Mv0UA\ntnL1FNaZtA7MXLSQvTbkl8+nbLisg6EgcDcN1cFK5hjD3YypnaZAT0BMOF3tFy3+\njcyhWrM1cBSm+DxI0qInz84/gQKBgQDBBQ2mB3ABaaxXgRgsgQHGGQfhQn02SEOs\n+ZN1tbdICIuHSHd/bh3H0pDKrUNZakJyZ0547KCsGxaUPosnVPkzGhiCORYUoYH0\nPA9MB4QYCaACUaIlE7yHbjp7B+ZpjYiyVBMNQS0xjboibeqM8kotKFQOgQxpiixQ\ncMs/IjAQVwKBgHBBmSBtMMOEmC+rrpSvqSpPWOdVhZkhLhFHqELZLKYMrCt2rVMX\ntUO4UHwvx6jChgMrOcAg5WvPmEyLLTsZiFkKkrBZO7l8ZXIEOva7BvlGbSFVj58T\nn3mpwBxfOgCsqTwXzqr5O4EG8jEpXwhwkdi2VFQU+9j2fwucmZKbdrYBAoGBAIVH\nfP4o4pFHK4ackFmiltv3yrYjWBxUV86n4seDu1PU+qtmQYVPPucMoYghjYC/W7Rt\nWwUqt2M/rR6d9S4qgYxkt4mr63BBeV9w3UstYWvLsZ4ISkL51tNZLK5pbRNzdHFW\nlnUvjQpLh7xgU3YRk2CNGUWOnEh/7Ut6Jw2oCLIvAoGAFscyvbmnGcTEa8J+4i20\nehbRX0xd9pd+I0MDHpmyTL9uOCDlJX2YoNZKEpdeG/ghyVycL0UHol9uKH8SQI86\n0BglCWByhs7lLWLU3TuKlAbCXM/F04O4hEXHrpv4MbOQr2xkGjsCFmTMdeVYKJVF\nWLeRH9qHgQHmA7I3auISfeg=\n-----END PRIVATE KEY-----\n",
  client_email:
    process.env.GCP_CLIENT_EMAIL || "antigravity-agent@iitm01.iam.gserviceaccount.com",
  client_id: "101486420549447104007",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
};

export const FIREBASE_DATABASE_URL =
  process.env.FIREBASE_DATABASE_URL || "https://iitm01-aasra.firebaseio.com";
