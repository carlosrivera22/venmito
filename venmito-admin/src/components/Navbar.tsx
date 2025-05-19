// components/Navigation.jsx
import { useState } from "react";
import {
    AppBar,
    Box,
    Button,
    Container,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Toolbar,
    Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const menuItems = [
        { text: 'Dashboard', href: '/dashboard' },
        { text: 'People', href: '/people' },
        { text: 'Promotions', href: '/promotions' },
        { text: 'Transfers', href: '/transfers' },
        { text: "Transactions", href: '/transactions' },
    ];

    const drawer = (
        <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerToggle}>
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} component="a" href={item.href}>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
                <Divider />
            </List>
        </Box>
    );

    return (
        <>
            <AppBar position="static" color="default" elevation={0} sx={{ backgroundColor: 'white' }}>
                <Container>
                    <Toolbar disableGutters>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                            <Box
                                component="a"
                                href="/"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    textDecoration: 'none',
                                    color: 'inherit'
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    noWrap
                                    sx={{
                                        ml: 1,
                                        fontWeight: 700,
                                        color: 'text.primary',
                                    }}
                                >
                                    Venmito
                                </Typography>
                            </Box>
                        </Box>

                        {/* Desktop Navigation */}
                        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                            {menuItems.map((item) => (
                                <Button
                                    key={item.text}
                                    href={item.href}
                                    sx={{ mx: 1, color: 'text.secondary' }}
                                >
                                    {item.text}
                                </Button>
                            ))}
                        </Box>

                        {/* Mobile Navigation */}
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="end"
                            onClick={handleDrawerToggle}
                            sx={{ display: { md: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>
                    </Toolbar>
                </Container>
            </AppBar>

            <Drawer
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
                }}
            >
                {drawer}
            </Drawer>
        </>
    );
}