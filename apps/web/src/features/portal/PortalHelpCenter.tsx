import { Link } from "react-router-dom";
import { useState } from "react";

const categories = [
    {
        icon: "rocket_launch",
        title: "Getting Started",
        description: "Everything you need to launch your first workspace in minutes.",
        articleCount: 12,
    },
    {
        icon: "hub",
        title: "Remote Tools",
        description: "Optimizing performance for distributed teams and global scale.",
        articleCount: 8,
    },
    {
        icon: "account_balance_wallet",
        title: "Billing & Plans",
        description: "Manage subscriptions, tax compliance, and volume discounting.",
        articleCount: 24,
    },
    {
        icon: "security",
        title: "Security & Privacy",
        description: "Enterprise-grade security controls and GDPR/CCPA settings.",
        articleCount: 15,
    },
];

const topArticles = [
    { title: "How to configure SAML SSO with Okta", category: "Security", updated: "2 days ago" },
    { title: "Inviting your first 100 team members", category: "Workspace", updated: "1 week ago" },
    { title: "API Rate limits and optimization strategies", category: "Developers", updated: "3 days ago" },
    { title: "Exporting billing reports to CSV/XLS", category: "Finance", updated: "1 month ago" },
];

const recentUpdates = [
    {
        type: "New Platform Update",
        title: "v2.4.0 Release Notes",
        description: "Introducing native dark mode, enhanced report filtering, and the new audit log dashboard.",
        badge: "bg-primary/20 text-foreground",
    },
    {
        type: "Maintenance",
        title: "Scheduled Maintenance: June 15",
        description: "We'll be performing database upgrades between 02:00 and 04:00 UTC.",
        badge: "bg-blue-100 text-blue-800",
    },
];

export function PortalHelpCenter() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="w-full py-12 md:py-20 hero-gradient border-b border-border -mx-8 -mt-8 mb-0 px-8">
                <div className="max-w-[800px] mx-auto text-center">
                    <div className="flex flex-col gap-4 mb-8">
                        <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-[-0.04em]">
                            How can we help today?
                        </h1>
                        <p className="text-muted-foreground text-lg font-medium max-w-2xl mx-auto">
                            Search our knowledge base for tutorials, API documentation, and expert FAQs to get your team moving faster.
                        </p>
                    </div>

                    <div className="relative group">
                        <label className="flex flex-col h-16 md:h-20 w-full shadow-xl shadow-primary/5">
                            <div className="flex w-full flex-1 items-stretch rounded-xl h-full overflow-hidden border-2 border-border focus-within:border-primary transition-all bg-card">
                                <div className="text-muted-foreground flex items-center justify-center pl-6">
                                    <span className="material-symbols-outlined text-2xl">search</span>
                                </div>
                                <input
                                    className="flex w-full min-w-0 flex-1 border-none bg-transparent focus:ring-0 px-4 text-foreground text-lg placeholder:text-muted-foreground/60 font-medium"
                                    placeholder="Search for articles, keywords, or error codes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <div className="flex items-center p-2 pr-2">
                                    <button className="h-full px-8 rounded-lg bg-primary text-primary-foreground font-bold text-base hover:brightness-95 transition-all">
                                        Search
                                    </button>
                                </div>
                            </div>
                        </label>

                        {/* Search Suggestions */}
                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Popular:</span>
                            <a className="text-xs font-bold text-foreground underline decoration-primary/50 hover:decoration-primary" href="#">SSO Setup</a>
                            <a className="text-xs font-bold text-foreground underline decoration-primary/50 hover:decoration-primary" href="#">API Limits</a>
                            <a className="text-xs font-bold text-foreground underline decoration-primary/50 hover:decoration-primary" href="#">Billing Export</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories Section */}
            <div className="py-12 md:py-16 -mx-8 px-8">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight">Browse Categories</h2>
                        <p className="text-muted-foreground font-medium mt-1">Select a topic to find specialized help guides.</p>
                    </div>
                    <a className="hidden md:flex items-center gap-1 text-sm font-bold text-foreground hover:underline" href="#">
                        View all documentation
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((category) => (
                        <div
                            key={category.title}
                            className="group flex flex-col gap-4 rounded-xl border-2 border-border bg-card p-6 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
                        >
                            <div className="size-12 rounded-lg bg-primary/20 flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                <span className="material-symbols-outlined">{category.icon}</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-lg font-bold leading-tight">{category.title}</h3>
                                <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                                    {category.description}
                                </p>
                            </div>
                            <div className="mt-auto pt-2 flex items-center gap-1 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                {category.articleCount} ARTICLES
                                <span className="material-symbols-outlined text-xs">chevron_right</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Articles Lists Section */}
            <div className="py-12 bg-card/50 -mx-8 px-8 border-y border-border">
                <div className="flex flex-col md:flex-row gap-12">
                    {/* Top Articles */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-primary text-2xl">trending_up</span>
                            <h2 className="text-[22px] font-bold leading-tight">Top Articles</h2>
                        </div>
                        <div className="flex flex-col divide-y divide-border">
                            {topArticles.map((article) => (
                                <a
                                    key={article.title}
                                    className="group py-4 flex items-center justify-between hover:translate-x-1 transition-transform"
                                    href="#"
                                >
                                    <div className="flex flex-col gap-1">
                                        <h4 className="font-semibold group-hover:text-primary transition-colors">
                                            {article.title}
                                        </h4>
                                        <p className="text-xs text-muted-foreground">
                                            {article.category} • Updated {article.updated}
                                        </p>
                                    </div>
                                    <span className="material-symbols-outlined text-muted-foreground text-sm">open_in_new</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Recent Updates */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-primary text-2xl">history</span>
                            <h2 className="text-[22px] font-bold leading-tight">Recent Updates</h2>
                        </div>
                        <div className="flex flex-col gap-4">
                            {recentUpdates.map((update) => (
                                <div key={update.title} className="p-5 rounded-xl bg-background border border-border">
                                    <span className={`inline-block px-2 py-0.5 text-[10px] font-black uppercase rounded mb-2 ${update.badge}`}>
                                        {update.type}
                                    </span>
                                    <h4 className="font-bold mb-2">{update.title}</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                                        {update.description}
                                    </p>
                                    <a className="text-xs font-bold text-foreground flex items-center gap-1" href="#">
                                        Read details
                                        <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Still Need Help CTA */}
            <div className="py-20 text-center -mx-8 px-8">
                <div className="size-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <span className="material-symbols-outlined text-4xl text-foreground">support_agent</span>
                </div>
                <h2 className="text-3xl font-black mb-4">Still need assistance?</h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
                    Can't find what you're looking for? Our support engineers are available 24/7 via chat and email.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/portal/tickets/new"
                        className="flex min-w-[200px] items-center justify-center rounded-xl h-14 px-8 bg-primary text-primary-foreground text-base font-black tracking-tight hover:brightness-95 transition-all"
                    >
                        Open a Support Ticket
                    </Link>
                    <button className="flex min-w-[200px] items-center justify-center rounded-xl h-14 px-8 border-2 border-border text-foreground text-base font-bold tracking-tight hover:bg-muted transition-all">
                        Chat with Us
                    </button>
                </div>
            </div>
        </div>
    );
}
