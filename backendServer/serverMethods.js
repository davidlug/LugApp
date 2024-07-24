// src/backendServer/serverMethods.js
var fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');


const { Team, TimeSlot, PlayingLocation, main } = require('./test.js'); // import from test.js
const app = express();
app.use(bodyParser.json());  // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
var port = 3001; // Choose a port for your backend server

const jsonFilePath = __dirname + "/leagues.json";  // Ensure this is correct


app.get('/leagues', function (req, res) {
    fs.readFile(__dirname + "/" + "leagues.json", 'utf8', function (err, data) {
        if (err) {
            console.error("Error reading file:", err);
            res.status(500).send("Error reading file");
            return;
        }
       // console.log(data);
        res.header("Content-Type", "application/json");
        res.send(data);
    });
});

app.get('/divisions/:leagueID', function (req, res) {
    const leagueID = parseInt(req.params.leagueID);
    
    fs.readFile(__dirname + "/" + "leagues.json", 'utf8', function (err, data) {
        if (err) {
            console.error("Error reading file:", err);
            res.status(500).send("Error reading file");
            return;
        }

        const leagues = JSON.parse(data).leagues;

        // Find the league tith the given ID
        const league = leagues.find(league => league.id === leagueID);
        if (!league) {
            res.status(404).send("League not found");
            return;
        }

        res.header("Content-Type", "application/json");
        res.send(JSON.stringify({ divisions: league.divisions, leagueName: league.league }));
    });
});

app.get('/league/:leagueID/division/:divisionID/team/:teamID', (req, res) => {
    const divisionID = parseInt(req.params.divisionID);
    const newTeamID = parseInt(req.params.teamID);
    const leagueID = parseInt(req.params.leagueID, 10);

    fs.readFile(__dirname + "/leagues.json", 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            res.status(500).json({ error: "Error reading file" });
            return;
        }

        let parseData;
        try {
            parseData = JSON.parse(data);
        } catch (jsonErr) {
            console.error("Error parsing JSON:", jsonErr);
            res.status(500).json({ error: "Error parsing JSON" });
            return;
        }

        //console.log("Current leagues: ", parseData);

        // Find the league with the given ID
        const league = parseData.leagues.find(league => league.id == leagueID);
        if (!league) {
            res.status(404).json({ error: "League not found" });
            return;
        }

        // Find the division
        let division = league.divisions.find(d => d.divisionID === divisionID);
        if (!division) {
            res.status(404).json({ message: 'Division not found.' });
            return;
        }


        // Find the team index
        let teamIndex = division.teams.findIndex(t => t.id === newTeamID);
        if (teamIndex === -1) {
            res.status(404).json({ message: 'Team not found.' });
            return;
        }

        let team = division.teams.find(t => t.id === (teamIndex+1));
       // console.log(team);

        console.log

        res.status(200).json({ team: team });

    });

});

app.get('/leagues/:leagueID/divisions/:divisionID/teams', (req, res) => {
    const leagueID = parseInt(req.params.leagueID);
    const divisionID = parseInt(req.params.divisionID);

    fs.readFile(__dirname + "/leagues.json", 'utf8', function (err, data) {
        if (err) {
            res.status(500).send("Error reading file");
            return;
        }

        const league = JSON.parse(data).leagues.find(league => league.id === leagueID);
        if (!league) {
            res.status(404).json({ error: "League not found" });
            return;
        }

        const division = league.divisions.find(division => division.divisionID === divisionID);
        if (!division) {
            res.status(404).json({ error: "Division not found" });
            return;
        }

        res.json({ teams: division.teams || [] , divisionName: division.divisionName, leagueName: league.league});
    });
});

app.get('/leagues/:leagueID/divisions/:divisionID/timeslots', (req, res) => {
    //console.log("Time Slots");
    const leagueID = parseInt(req.params.leagueID);
    const divisionID = parseInt(req.params.divisionID);

    fs.readFile(__dirname + "/leagues.json", 'utf8', function (err, data) {
        if (err) {
            res.status(500).send("Error reading file");
            return;
        }

        const league = JSON.parse(data).leagues.find(league => league.id === leagueID);
        if (!league) {
            res.status(404).json({ error: "League not found" });
            return;
        }

        const division = league.divisions.find(division => division.divisionID === divisionID);
        if (!division) {
            res.status(404).json({ error: "Division not found" });
            return;
        }
       // console.log(division.timeslots);

        res.json({ timeslots: division.timeslots || [] });
    });
});

app.get('/league/:leagueID/division/:divisionID/schedules', function(req, res) {
    fs.readFile(__dirname + "/leagues.json", 'utf8', function (err, data) {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).json({ error: "Failed to read data file" });
            return;
        }

        let parseData;
        try {
            parseData = JSON.parse(data);
        } catch (parseErr) {
            console.error('Error parsing JSON:', parseErr);
            res.status(500).json({ error: "Failed to parse data file" });
            return;
        }

        const leagueID = parseInt(req.params.leagueID, 10);
        const divisionID = parseInt(req.params.divisionID, 10);


        const league = parseData.leagues.find(league => league.id === leagueID);
        if (!league) {
            res.status(404).json({ error: "League not found" });
            return;
        }

        const division = league.divisions.find(division => division.divisionID === divisionID);
        if (!division) {
            res.status(404).json({ error: "Division not found" });
            return;
        }

        res.header("Content-Type", "application/json");
        res.send(JSON.stringify({ schedule: division.schedule }));
    });
});

app.get('/league/:leagueID/division/:divisionID/team/:teamID/weight', (req, res) => {
    const divisionID = parseInt(req.params.divisionID);
    const newTeamID = parseInt(req.params.teamID);
    const leagueID = parseInt(req.params.leagueID, 10);

    fs.readFile(__dirname + "/leagues.json", 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            res.status(500).json({ error: "Error reading file" });
            return;
        }

        let parseData;
        try {
            parseData = JSON.parse(data);
        } catch (jsonErr) {
            console.error("Error parsing JSON:", jsonErr);
            res.status(500).json({ error: "Error parsing JSON" });
            return;
        }

        //console.log("Current leagues: ", parseData);

        // Find the league with the given ID
        const league = parseData.leagues.find(league => league.id == leagueID);
        if (!league) {
            res.status(404).json({ error: "League not found" });
            return;
        }

        // Find the division
        let division = league.divisions.find(d => d.divisionID === divisionID);
        if (!division) {
            res.status(404).json({ message: 'Division not found.' });
            return;
        }


        // Find the team index
        let teamIndex = division.teams.findIndex(t => t.id === newTeamID);
        if (teamIndex === -1) {
            res.status(404).json({ message: 'Team not found.' });
            return;
        }

        let team = division.teams.find(t => t.id === (teamIndex+1));
       // console.log(team);

        let teamWeight = team.weight

        res.status(200).json({ weight: teamWeight });

    });

});

app.get('/league/:leagueID/division/:divisionID/schedule', function (req, res) {
    //console.log(`Request Received ${leagueID} ${division}`);
    console.log("Request Received");

    const filePath = __dirname + "/leagues.json";
    console.log("Reading file:", filePath);

    fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).json({ error: "Failed to read data file" });
            return;
        }

        console.log("File read successfully. Parsing JSON...");

        let parseData;
        try {
            parseData = JSON.parse(data);
            console.log("JSON parsed successfully");
        } catch (parseErr) {
            console.error('Error parsing JSON:', parseErr);
            res.status(500).json({ error: "Failed to parse data file" });
            return;
        }

        const leagueID = parseInt(req.params.leagueID, 10);
        const divisionID = parseInt(req.params.divisionID, 10);
        const freezeWeeks = req.query.freezeWeeks ? req.query.freezeWeeks.split(",") : [];
        const lastWeek = freezeWeeks.length ? parseInt(freezeWeeks[freezeWeeks.length - 1], 10) : 0;

        //console.log("Freeze Weeks:", freezeWeeks, "Last Week:", lastWeek);
        console.log("parseData");
        console.log(parseData);
        const league = parseData.leagues.find(league => league.id === leagueID);
        if (!league) {
            console.error("League not found:", leagueID);
            res.status(404).json({ error: "League not found" });
            return;
        }

       // console.log("League found:", league);

        const division = league.divisions.find(division => division.divisionID === divisionID);
        if (!division) {
            console.error("Division not found:", divisionID);
            res.status(404).json({ error: "Division not found" });
            return;
        }

        //console.log("Division found:", division);

        // console.log("Division Teams:");
        // console.log(division.teams);

        // console.log("Old Schedule:");
        // console.log(division.schedule);


        
        //const freezeSchedule = (division.schedule).slice(0, lastWeek);

        //console.log("Calling MAIN function...");
        const newSchedule = main(division.teams, division.timeslots, 0.5, lastWeek);
        division.schedule = newSchedule

        for (let week of division.schedule) {
            for (let ts of week) {
                if (ts.match) {
                    ts.match.homeTeam.gamesPlayed = 0;
                    ts.match.awayTeam.gamesPlayed = 0;
                }
            }
        }
        

        console.log("New Schedule generated:");
       // console.log(newSchedule);

        //  for(let i = 0; i < newSchedule.length; i++)
        //     {
        //         console.log("Teams");
        //         console.log(division.teams[i]);
        //        // division.teams[i].gamesPlayed = 0;
                                  
        //     }

         for(let i = 0; i < newSchedule.length; i++)
            {
                for(let m = 0; m < newSchedule[i].length; m++)
                    {
                        for(let k = 0; k < division.teams.length; k++)
                            {
                                // console.log(newSchedule[i][m].week);
                                // console.log(newSchedule[i][m].match);
                                if(division.teams[k].teamName === newSchedule[i][m].match.homeTeam.teamName || division.teams[k].teamName === newSchedule[i][m].match.awayTeam.teamName)
                                    {
                                        division.teams[k].gamesPlayed++;
                                    }
                            }
                    }
                
            }

            for(let i = 0; i < division.teams.length; i++)
                {
                //    console.log(division.teams[i].gamesPlayed);
                }

        fs.writeFile(filePath, JSON.stringify(parseData, null, 2), 'utf8', (writeErr) => {
            if (writeErr) {
                console.error('Error writing file:', writeErr);
                res.status(500).json({ error: "Failed to write data file" });
                return;
            }

            console.log('New Schedule written to file successfully');
            res.status(200).json({ message: 'Schedule generated and saved successfully', schedule: newSchedule });
        });
    });
});

app.put('/league/:leagueID/division/:divisionID/teams', (req, res) => {
    const divisionID = parseInt(req.params.divisionID, 10);
    const leagueID = parseInt(req.params.leagueID, 10);
    const teamData = req.body;

    console.log(`Received PUT request for leagueID: ${leagueID}, divisionID: ${divisionID}`);
    console.log("Received teamData:", teamData);

    // Check if the parameters are correctly extracted
    if (!leagueID || !divisionID) {
        console.error('Missing parameters');
        return res.status(400).send('Missing parameters.');
    }

    const jsonFilePath = __dirname + "/leagues.json";
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('An error occurred while reading the file.');
        }

        console.log('File read successfully');

        let parseData;
        try {
            parseData = JSON.parse(data);
            console.log("Parsed JSON data:", parseData);
        } catch (jsonErr) {
            console.error("Error parsing JSON:", jsonErr);
            return res.status(500).json({ error: "Error parsing JSON" });
        }

        const league = parseData.leagues.find(league => league.id === leagueID);
        if (!league) {
            console.log('League not found');
            return res.status(404).send('League not found.');
        }

        const division = league.divisions.find(division => division.divisionID === divisionID);
        if (!division) {
            console.log('Division not found');
            return res.status(404).send('Division not found.');
        }  

        console.log("Current division before update:", division);
        division.teams = teamData;
        console.log("Updated division after setting teams:", division);

        fs.writeFile(jsonFilePath, JSON.stringify(parseData, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).send('An error occurred while writing the file.');
            }

            console.log('File written successfully');
            res.status(200).json({ message: 'League updated successfully', data: teamData });
        });
    });
});

app.put('/league/:leagueID/division/:divisionID/schedule', (req, res) => {
    const divisionID = parseInt(req.params.divisionID);
    const leagueID = parseInt(req.params.leagueID, 10);
    const schedule = req.body;

    console.log(`Received PUT request for leagueID: ${leagueID}, divisionID: ${divisionID}`);
    console.log("Received schedule data:");

    // Check if the parameters are correctly extracted
    if (!leagueID || !divisionID) {
        console.error('Missing parameters');
        return res.status(400).send('Missing parameters.');
    }

    fs.readFile(__dirname + "/leagues.json", 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('An error occurred while reading the file.');
        }

        console.log('File read successfully');

        let parseData;
        try {
            parseData = JSON.parse(data);
        } catch (jsonErr) {
            console.error("Error parsing JSON:", jsonErr);
            res.status(500).json({ error: "Error parsing JSON" });
            return;
        }

        const league = parseData.leagues.find(league => league.id === leagueID);
        if (!league) {
            console.log('League not found');
            return res.status(404).send('League not found.');
        }

        const division = league.divisions.find(division => division.divisionID === divisionID);
        if (!division) {
            console.log('Division not found');
            return res.status(404).send('Division not found.');
        }

       
        console.log("Updating team:",);
        console.log(schedule);
        division.schedule = schedule;

        fs.writeFile(jsonFilePath, JSON.stringify(parseData, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).send('An error occurred while writing the file.');
            }

            res.status(200).json({ message: 'League updated successfully', data: parseData });
        });
    });
});

app.put('/league/:leagueID/division/:divisionID/team/:teamID', (req, res) => {
    const divisionID = parseInt(req.params.divisionID);
    const teamID = parseInt(req.params.teamID);
    const leagueID = parseInt(req.params.leagueID, 10);
        const teamData = req.body;

    console.log(`Received PUT request for leagueID: ${leagueID}, divisionID: ${divisionID}, teamID: ${teamID}`);
    console.log("Received teamData:", teamData);

    // Check if the parameters are correctly extracted
    if (!leagueID || !divisionID || !teamID) {
        console.error('Missing parameters');
        return res.status(400).send('Missing parameters.');
    }

    fs.readFile(__dirname + "/leagues.json", 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('An error occurred while reading the file.');
        }

        console.log('File read successfully');

        let parseData;
        try {
            parseData = JSON.parse(data);
        } catch (jsonErr) {
            console.error("Error parsing JSON:", jsonErr);
            res.status(500).json({ error: "Error parsing JSON" });
            return;
        }

        const league = parseData.leagues.find(league => league.id === leagueID);
        if (!league) {
            console.log('League not found');
            return res.status(404).send('League not found.');
        }

        const division = league.divisions.find(division => division.divisionID === divisionID);
        if (!division) {
            console.log('Division not found');
            return res.status(404).send('Division not found.');
        }

        const teamIndex = division.teams.findIndex(team => team.id === teamID);
        if (teamIndex === -1) {
            console.log('Team not found');
            return res.status(404).send('Team not found.');
        }

        // Ensure the teamData includes the id as an integer
        teamData.id = teamID;

        const updatedTeamData = { ...teamData, id: teamID };
        delete updatedTeamData.teamID;

        console.log("Updating team:", updatedTeamData);
        division.teams[teamIndex] = updatedTeamData;

        fs.writeFile(jsonFilePath, JSON.stringify(parseData, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).send('An error occurred while writing the file.');
            }

            res.status(200).json({ message: 'League updated successfully', data: parseData });
        });
    });
});

app.put('/league/:leagueID/division/:divisionID/timeslot/:timeslotID', (req, res) => {
    const divisionID = parseInt(req.params.divisionID);
    const timeslotID = parseInt(req.params.timeslotID);
    const leagueID = parseInt(req.params.leagueID, 10);
        const timeslotData = req.body;

    console.log(`Received PUT request for leagueID: ${leagueID}, divisionID: ${divisionID}, timeslotID: ${timeslotID}`);
    console.log("Received timeslot data:", timeslotData);

    // Check if the parameters are correctly extracted
    if (!leagueID || !divisionID || !timeslotID) {
        console.error('Missing parameters');
        return res.status(400).send('Missing parameters.');
    }

    fs.readFile(__dirname + "/leagues.json", 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('An error occurred while reading the file.');
        }

        console.log('File read successfully');

        let parseData;
        try {
            parseData = JSON.parse(data);
        } catch (jsonErr) {
            console.error("Error parsing JSON:", jsonErr);
            res.status(500).json({ error: "Error parsing JSON" });
            return;
        }

        const league = parseData.leagues.find(league => league.id === leagueID);
        if (!league) {
            console.log('League not found');
            return res.status(404).send('League not found.');
        }

        const division = league.divisions.find(division => division.divisionID === divisionID);
        if (!division) {
            console.log('Division not found');
            return res.status(404).send('Division not found.');
        }

        const timeslotIndex = division.timeslots.findIndex(timeslot => timeslot.id === timeslotID);
        if (timeslotIndex === -1) {
            console.log('Timeslot not found');
            return res.status(404).send('Timeslot not found.');
        }

        // Ensure the teamData includes the id as an integer
        timeslotData.id = timeslotID;

        const updatedTimeslotData = { ...timeslotData, id: timeslotID };
        delete updatedTimeslotData.timeslotID;

        console.log("Updating team:", updatedTimeslotData);
        division.timeslots[timeslotIndex] = updatedTimeslotData;

        fs.writeFile(jsonFilePath, JSON.stringify(parseData, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).send('An error occurred while writing the file.');
            }

            res.status(200).json({ message: 'League updated successfully', data: parseData });
        });
    });
});

app.post('/league', function (req, res) {
    console.log("Request Received");
    fs.readFile(__dirname + "/" + "leagues.json", 'utf8', function (err, data) {
        let parseData = JSON.parse(data);
        console.log("Current leagues: ", parseData);

        const newLeague = req.body;

        console.log("New League", newLeague);

        const newLeagueID = parseData.leagues.length + 1;

        console.log("ID " + newLeagueID);

        newLeague.id = newLeagueID;

        parseData.leagues.push(newLeague);

        const updatedData = JSON.stringify(parseData, null, 2);

        fs.writeFile(__dirname + "/leagues.json", updatedData, function (writeErr) {
            console.log('League added successfully');
            res.status(200).json({ message: 'League added successfully', data: parseData });
        });
    });
});

app.post('/leagues/:leagueID/division', function (req, res) {
    console.log("Request Received");
    fs.readFile(__dirname + "/" + "leagues.json", 'utf8', function (err, data) {
        if (err) {
            console.error("Error reading file:", err);
            res.status(500).json({ error: "Error reading file" });
            return;
        }

        let parseData;
        try {
            parseData = JSON.parse(data);
        } catch (jsonErr) {
            console.error("Error parsing JSON:", jsonErr);
            res.status(500).json({ error: "Error parsing JSON" });
            return;
        }

        console.log("Current leagues: ", parseData);

        const newDivision = req.body;
        const leagueID = parseInt(req.params.leagueID, 10);

        // Find the league with the given ID
        const league = parseData.leagues.find(league => league.id === leagueID);
        if (!league) {
            res.status(404).json({ error: "League not found" });
            return;
        }

        // Initialize the divisions array if it doesn't exist
        if (!league.divisions) {
            league.divisions = [];
        }

        // Determine the new division ID
        const newDivisionID = league.divisions.length > 0 
            ? Math.max(...league.divisions.map(div => div.divisionID)) + 1 
            : 1;

        newDivision.divisionID = newDivisionID;

        league.divisions.push(newDivision);
        const updatedData = JSON.stringify(parseData, null, 2);

        fs.writeFile(__dirname + "/leagues.json", updatedData, function (writeErr) {
            if (writeErr) {
                console.error("Error writing file:", writeErr);
                res.status(500).json({ error: "Error writing file" });
                return;
            }

            console.log('Division added successfully');
            res.status(200).json({ message: 'Division added successfully', data: parseData });
        });
    });
});

app.post('/league/:leagueID/division/:divisionID/team', function (req, res) {
    console.log("Request Received");
    
    fs.readFile(__dirname + "/" + "leagues.json", 'utf8', function (err, data) {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).json({ error: "Failed to read data file" });
            return;
        }

        let parseData;
        try {
            parseData = JSON.parse(data);
        } catch (parseErr) {
            console.error('Error parsing JSON:', parseErr);
            res.status(500).json({ error: "Failed to parse data file" });
            return;
        }


        const newTeam = req.body;
        const leagueID = parseInt(req.params.leagueID, 10);
        const divisionID = parseInt(req.params.divisionID, 10);

        const league = parseData.leagues.find(league => league.id === leagueID);
        if (!league) {
            res.status(404).json({ error: "League not found" });
            return;
        }

        console.log("Current league: ", league);


        const division = league.divisions.find(division => division.divisionID === divisionID);



        if (!division) {
            res.status(404).json({ error: "This Division not found" });
            return;
        }

        const newTeamID = division.teams.length > 0 
            ? Math.max(...division.teams.map(team => team.id)) + 1 
            : 1;

        newTeam.id = newTeamID;
        division.teams.push(newTeam);

        const updatedData = JSON.stringify(parseData, null, 2);

        fs.writeFile(__dirname + "/leagues.json", updatedData, function (writeErr) {
            if (writeErr) {
                console.error('Error writing file:', writeErr);
                res.status(500).json({ error: "Failed to write data file" });
                return;
            }

            console.log('Team added successfully');
            res.status(200).json({ message: 'Team added successfully', data: parseData });
        });
    });
});

app.post('/league/:leagueID/division/:divisionID/timeslot', function (req, res) {
    console.log("Request Received");
    
    fs.readFile(__dirname + "/" + "leagues.json", 'utf8', function (err, data) {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).json({ error: "Failed to read data file" });
            return;
        }

        let parseData;
        try {
            parseData = JSON.parse(data);
        } catch (parseErr) {
            console.error('Error parsing JSON:', parseErr);
            res.status(500).json({ error: "Failed to parse data file" });
            return;
        }

        const newTimeSlot = req.body;
        const leagueID = parseInt(req.params.leagueID, 10);
        const divisionID = parseInt(req.params.divisionID, 10);

        const league = parseData.leagues.find(league => league.id === leagueID);
        if (!league) {
            res.status(404).json({ error: "League not found" });
            return;
        }

        console.log("Current league: ", league);

        const division = league.divisions.find(division => division.divisionID === divisionID);
        if (!division) {
            res.status(404).json({ error: "This Division not found" });
            return;
        }

        // Ensure timeslots array is initialized
        if (!Array.isArray(division.timeslots)) {
            division.timeslots = [];
        }

        console.log(division.timeslots.length);

        const newTimeslotID = division.timeslots.length > 0 
            ? Math.max(...division.timeslots.map(timeslot => timeslot.id)) + 1 
            : 1;

        newTimeSlot.id = newTimeslotID;
        division.timeslots.push(newTimeSlot);

        const updatedData = JSON.stringify(parseData, null, 2);

        fs.writeFile(__dirname + "/leagues.json", updatedData, function (writeErr) {
            if (writeErr) {
                console.error('Error writing file:', writeErr);
                res.status(500).json({ error: "Failed to write data file" });
                return;
            }

            console.log('Timeslot added successfully');
            res.status(200).json({ message: 'Timeslot added successfully', data: parseData });
        });
    });
});

app.post('/league/:leagueID/division/:divisionID/teams', function (req, res) {
    // console.log("Request Received");
 
     fs.readFile(__dirname + "/" + "leagues.json", 'utf8', function (err, data) {
         if (err) {
             console.error('Error reading file:', err);
             res.status(500).json({ error: "Failed to read data file" });
             return;
         }
 
         let parseData;
         try {
             parseData = JSON.parse(data);
         } catch (parseErr) {
             console.error('Error parsing JSON:', parseErr);
             res.status(500).json({ error: "Failed to parse data file" });
             return;
         }
 
         const newTeams = req.body; // Array of new teams
         const leagueID = parseInt(req.params.leagueID, 10);
         const divisionID = parseInt(req.params.divisionID, 10);
 
         const league = parseData.leagues.find(league => league.id === leagueID);
         if (!league) {
             res.status(404).json({ error: "League not found" });
             return;
         }
 
         //console.log("Current league: ", league);
 
         const division = league.divisions.find(division => division.divisionID === divisionID);
         if (!division) {
             res.status(404).json({ error: "Division not found" });
             return;
         }
 
         newTeams.forEach(newTeam => {
             const newTeamID = division.teams.length > 0
                 ? Math.max(...division.teams.map(team => team.id)) + 1
                 : 1;
 
             newTeam.id = newTeamID;
             division.teams.push(newTeam);
         });
 
         const updatedData = JSON.stringify(parseData, null, 2);
 
         fs.writeFile(__dirname + "/leagues.json", updatedData, function (writeErr) {
             if (writeErr) {
                 console.error('Error writing file:', writeErr);
                 res.status(500).json({ error: "Failed to write data file" });
                 return;
             }
 
             console.log('Teams added successfully');
             res.status(200).json({ message: 'Teams added successfully', data: parseData });
         });
     });
 });
 
 app.post('/league/:leagueID/division/:divisionID/timeslots', function (req, res) {
     console.log("Request Received");
 
     fs.readFile(__dirname + "/" + "leagues.json", 'utf8', function (err, data) {
         if (err) {
             console.error('Error reading file:', err);
             res.status(500).json({ error: "Failed to read data file" });
             return;
         }
 
         let parseData;
         try {
             parseData = JSON.parse(data);
         } catch (parseErr) {
             console.error('Error parsing JSON:', parseErr);
             res.status(500).json({ error: "Failed to parse data file" });
             return;
         }
 
         const newTimeslots = req.body; // Array of new teams
         const leagueID = parseInt(req.params.leagueID, 10);
         const divisionID = parseInt(req.params.divisionID, 10);
 
         const league = parseData.leagues.find(league => league.id === leagueID);
         if (!league) {
             res.status(404).json({ error: "League not found" });
             return;
         }
 
         console.log("Current league: ", league);
 
         const division = league.divisions.find(division => division.divisionID === divisionID);
         if (!division) {
             res.status(404).json({ error: "Division not found" });
             return;
         }
 
         if (!Array.isArray(division.timeslots)) {
             division.timeslots = [];
         }
 
         newTimeslots.forEach(newTimeslot => {
             const newTimeslotID = division.timeslots.length > 0
                 ? Math.max(...division.timeslots.map(timeslot => timeslot.id)) + 1
                 : 1;
 
             newTimeslot.id = newTimeslotID;
             division.timeslots.push(newTimeslot);
         });
 
         const updatedData = JSON.stringify(parseData, null, 2);
 
         fs.writeFile(__dirname + "/leagues.json", updatedData, function (writeErr) {
             if (writeErr) {
                 console.error('Error writing file:', writeErr);
                 res.status(500).json({ error: "Failed to write data file" });
                 return;
             }
 
             console.log('Timeslots added successfully');
             res.status(200).json({ message: 'Timeslots added successfully', data: parseData });
         });
     });
 });
 
 app.delete('/league/:leagueID/division/:divisionID/team/:teamID', (req, res) => {
    const divisionID = parseInt(req.params.divisionID);
    const newTeamID = parseInt(req.params.teamID);
    const leagueID = parseInt(req.params.leagueID, 10);

    fs.readFile(__dirname + "/leagues.json", 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            res.status(500).json({ error: "Error reading file" });
            return;
        }

        let parseData;
        try {
            parseData = JSON.parse(data);
        } catch (jsonErr) {
            console.error("Error parsing JSON:", jsonErr);
            res.status(500).json({ error: "Error parsing JSON" });
            return;
        }

        console.log("Current leagues: ", parseData);

        // Find the league with the given ID
        const league = parseData.leagues.find(league => league.id === leagueID);
        if (!league) {
            res.status(404).json({ error: "League not found" });
            return;
        }

        // Find the division
        let division = league.divisions.find(d => d.divisionID === divisionID);
        if (!division) {
            res.status(404).json({ message: 'Division not found.' });
            return;
        }

        // Find the team index
        let teamIndex = division.teams.findIndex(t => t.id === newTeamID);
        console.log("Index: " + teamIndex);
        if (teamIndex === -1) {
            res.status(404).json({ message: 'Team not found.' });
            return;
        }

        // Remove the team from the division
        division.teams.splice(teamIndex, 1);
        
        // Convert the modified object back to a JSON string
        const updatedData = JSON.stringify(parseData, null, 2);

        // Write the updated JSON string back to the file
        fs.writeFile(__dirname + "/leagues.json", updatedData, (writeErr) => {
            if (writeErr) {
                console.error("Error writing file:", writeErr);
                res.status(500).json({ error: "Error writing file" });
                return;
            }

            console.log('Team has been deleted successfully');
            res.status(200).json({ message: 'Team has been deleted successfully', data: parseData });
        });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
