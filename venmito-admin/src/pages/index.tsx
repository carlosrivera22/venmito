import Head from "next/head";
import {
  Box,
  Button,
  Container,
  Typography,
} from "@mui/material";

export default function Home() {
  return (
    <>
      <Head>
        <title>Venmito - Modern Database Management</title>
        <meta name="description" content="Database management for growing businesses" />
      </Head>

      {/* Main container with 100vh height */}
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#f5f5f7"
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            flexGrow: 1,
            display: "flex",
          }}
        >
          {/* Flexbox container for columns */}
          <Box
            sx={{
              display: "flex",
              width: "100%",
              flexDirection: { xs: "column", md: "row" },
              minHeight: "100vh",
              alignItems: "center",
              gap: 4
            }}
          >
            {/* Left column */}
            <Box
              sx={{
                flex: 1,
                width: { xs: "100%", md: "50%" },
                mt: { xs: 5, sm: 5, md: 0 },
              }}
            >
              <Typography
                variant="h2"
                component="h1"
                sx={{ mb: 3, fontWeight: 700 }}
              >
                Modern database management for{' '}
                <Box component="span" sx={{ color: "#2563eb" }}>
                  growing businesses
                </Box>
              </Typography>
              <Button variant={'contained'}>
                Start by Adding People
              </Button>
            </Box>

            {/* Right column - can be used for image or additional content */}
            <Box
              sx={{
                flex: 1,
                width: { xs: "100%", md: "50%" },
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {/* Placeholder for image or additional content */}
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}