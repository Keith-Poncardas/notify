function timeAgo(dateInput) {
    const now = new Date();
    const past = new Date(dateInput);
    const diff = (now - past) / 1000; // in seconds

    const units = [
        { name: "year", seconds: 31536000 },
        { name: "month", seconds: 2592000 },
        { name: "week", seconds: 604800 },
        { name: "day", seconds: 86400 },
        { name: "hour", seconds: 3600 },
        { name: "minute", seconds: 60 },
        { name: "second", seconds: 1 }
    ];

    for (const unit of units) {
        const value = Math.floor(diff / unit.seconds);
        if (value >= 1) {
            if (value === 1) {
                return `1 ${unit.name} ago`;
            } else {
                return `${value} ${unit.name}s ago`;
            }
        }
    }

    return "just now";
};

const timeFormatterGlobal = (req, res, next) => {
    res.locals.timeAgo = timeAgo;
    next();
};

module.exports = { timeFormatterGlobal };