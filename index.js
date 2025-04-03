import dotenv from "dotenv";
import cors from "cors";
import express from "express";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

function generateId() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let shortUrl = "";
    for (let i = 0; i < 16; i++) {
        shortUrl += chars[Math.floor(Math.random() * chars.length)];
    };
    return shortUrl;
};

function handleOption(list, from, to, limit) {
    let newList
    if (from && to) {
        // const sortedList = [...list];
        // sortedList.sort((a, b) => new Date(a.date) - new Date(b.date))
        const startDate = new Date(from);
        const endDate = new Date(to);

        if (limit) {
            let filteredList = list.filter(item => {
                const itemDate = new Date(item["date"]);
                return itemDate >= startDate && itemDate <= endDate;
            });
            return newList = filteredList.slice(0, limit)
        } else {
            return newList = list.filter(item => {
                const itemDate = new Date(item["date"]);
                return itemDate >= startDate && itemDate <= endDate;
            });
        }
    } else if (limit) {
        return newList = list.slice(0, limit)
    } else {
        return newList = list
    }
};

const users = [];
const exercises = {};

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(`${process.cwd()}/public`));

app.route("/")
.get((req, res) => {
    res.sendFile(`${process.cwd()}/views/index.html`)
});
app.route("/api/users")
.post((req, res) => {
    let user_id = generateId();
    const userObject = {
        username: req["body"]["username"],
        _id: user_id
    };
    users.push(userObject);
    res.json(userObject);
}).get((req, res) => {
    res.json(users)
});
app.route("/api/users/:_id/exercises")
.post((req, res) => {
    const savingDate = req["body"]["date"] ? new Date(req["body"]["date"]) : new Date;
    const exerciseObject = {
        description: req["body"]["description"],
        duration: Number(req["body"]["duration"]),
        date: savingDate.toDateString(),
    };

    const userSaving = users.find(item => item["_id"] == req["params"]["_id"])

    // exercises[userSaving["_id"]] = (exerciseObject);
    if (!exercises[userSaving["_id"]]) {
        exercises[userSaving["_id"]] = [];
    };
    exercises[userSaving["_id"]].push(exerciseObject);

    const resObject = {
        username: userSaving["username"],
        description: req["body"]["description"],
        duration: Number(req["body"]["duration"]),
        date: savingDate.toDateString(),
        _id: req["params"]["_id"]
    };

    res.json(resObject)
});
app.route("/api/users/:_id/logs")
.get((req, res) => {
    const reqUser = users.find(item => item["_id"] == req["params"]["_id"]);
    const exerciseList = exercises[reqUser["_id"]] || [];
    // const exerciseList = Object.keys(exercises).filter(key => key === reqUser["_id"]).map(key => exercises[key]);
    let logList = handleOption(exerciseList, req["query"]["from"], req["query"]["to"], req["query"]["limit"]);
    const logObject = {
        username: reqUser["username"],
        count: exerciseList.length,
        _id: req["params"]["_id"],
        log: logList
    };
    res.json(logObject)
});

app.listen(port, () => console.log(`Server is listening on port ${port}`));
