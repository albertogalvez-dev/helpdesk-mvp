import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Headphones, CheckCircle, Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";

const Layout = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="min-h-screen bg-background">
        <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link to="/" className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
                        <Headphones className="h-5 w-5 text-foreground" />
                    </div>
                    <span className="text-lg font-semibold text-foreground">HelpDesk</span>
                </Link>
                <Link to="/login">
                    <Button size="sm">Login</Button>
                </Link>
            </div>
        </nav>

        <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <Link to="/">
                <Button variant="ghost" className="mb-6 gap-2 text-muted-foreground">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                </Button>
            </Link>
            <h1 className="text-3xl font-semibold">{title}</h1>
            <div className="mt-6 space-y-6 text-sm text-muted-foreground">{children}</div>
        </main>

        <footer className="border-t border-border bg-background">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
                <div className="flex items-center gap-2">
                    <Headphones className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">HelpDesk</span>
                </div>
                <p>(c) 2026 HelpDesk. All rights reserved.</p>
                <div className="flex gap-6">
                    <Link to="/privacy" className="hover:text-foreground">
                        Privacy
                    </Link>
                    <Link to="/terms" className="hover:text-foreground">
                        Terms
                    </Link>
                    <Link to="/contact" className="hover:text-foreground">
                        Contact
                    </Link>
                </div>
            </div>
        </footer>
    </div>
);

export function PrivacyPage() {
    return (
        <Layout title="Privacy Policy">
            <p>
                At HelpDesk, we take your privacy seriously. This Privacy Policy
                explains how your personal information is collected, used, and shared
                when you visit our site.
            </p>
            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">
                    1. Information We Collect
                </h3>
                <p>
                    We collect device information using technologies such as cookies.
                    These data files are placed on your device or computer and often
                    include an anonymous unique identifier.
                </p>
            </div>
            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">
                    2. How We Use Your Information
                </h3>
                <p>
                    We use the information we collect to fulfill requests, provide
                    support, and improve the HelpDesk experience.
                </p>
            </div>
        </Layout>
    );
}

export function TermsPage() {
    return (
        <Layout title="Terms of Service">
            <p>
                This website is operated by HelpDesk. Throughout the site, the terms
                "we", "us", and "our" refer to HelpDesk.
            </p>
            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">
                    1. Online Store Terms
                </h3>
                <p>
                    By agreeing to these Terms of Service, you represent that you are
                    at least the age of majority in your state or province of residence.
                </p>
            </div>
        </Layout>
    );
}

export function ContactPage() {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <Layout title="Contact Us">
                <Card>
                    <CardContent className="py-12 text-center">
                        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15">
                            <CheckCircle className="h-7 w-7 text-foreground" />
                        </div>
                        <h2 className="text-2xl font-semibold text-foreground">Message sent</h2>
                        <p className="mt-3 text-sm text-muted-foreground">
                            Thank you for reaching out. Our support team will respond within
                            24 hours.
                        </p>
                        <Button className="mt-6" onClick={() => setSubmitted(false)}>
                            Send Another Message
                        </Button>
                    </CardContent>
                </Card>
            </Layout>
        );
    }

    return (
        <Layout title="Contact Us">
            <div className="grid gap-10 lg:grid-cols-2">
                <div className="space-y-8">
                    <p className="text-base text-muted-foreground">
                        Have questions about plans, features, or need technical support?
                        Fill out the form and our team will get back to you shortly.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    First Name
                                </label>
                                <Input placeholder="John" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Last Name
                                </label>
                                <Input placeholder="Doe" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Email</label>
                            <Input type="email" placeholder="john@company.com" required />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Message</label>
                            <textarea
                                className="min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                placeholder="How can we help you?"
                                required
                            />
                        </div>

                        <Button type="submit" size="lg" className="w-full">
                            Send Message
                        </Button>
                    </form>
                </div>

                <Card>
                    <CardContent className="space-y-8">
                        <div>
                            <h3 className="text-xl font-semibold text-foreground">
                                Contact Information
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Reach out to us through any of the channels below.
                            </p>
                        </div>

                        <div className="space-y-6 text-sm text-muted-foreground">
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                    <Mail className="h-5 w-5 text-foreground" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Email</p>
                                    <a
                                        href="mailto:support@helpdesk.com"
                                        className="hover:text-foreground"
                                    >
                                        support@helpdesk.com
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                    <Phone className="h-5 w-5 text-foreground" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Phone</p>
                                    <p>+1 (555) 123-4567</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                    <MapPin className="h-5 w-5 text-foreground" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Office</p>
                                    <p>
                                        123 Support St, Suite 100
                                        <br />
                                        Tech City, TC 90210
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
