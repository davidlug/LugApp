import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import DatePicker from "react-datepicker";
import TimePicker from 'react-time-picker';

import "react-datepicker/dist/react-datepicker.css";
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';

const TimeSlotCreate = () => {
    const { leagueID } = useParams();
    const { divisionID } = useParams();

    const [id, idChange] = useState("");
    const [week, weekChange] = useState(0);
    const [date, dateChange] = useState(new Date());
    const [startTime, startTimeChange] = useState('10:00');
    const [endTime, endTimeChange] = useState('10:00');
    const [facility, facilityChange] = useState("");
    const [rink, rinkChange] = useState("");
    const [premium, premiumChange] = useState(false);
    const navigate = useNavigate();

    const handlesubmit = (e) => {
        e.preventDefault();
        const formattedDate = date.toISOString().split('T')[0];

        const timeslotData = { week, date: formattedDate, startTime, endTime, facility, rink, premium };
        console.log("Submitted data: ", timeslotData);
        fetch(`http://localhost:8080/league/${leagueID}/division/${divisionID}/timeslot`, {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(timeslotData)
        }).then((res) => {
            return res.json();
        }).then((data) => {
            alert("Timeslot saved successfully.");
            console.log("Response Data: ", data);
            navigate("/");
        }).catch((err) => {
            console.log(err.message);
        });
    }

    const handleBack = () => {
        navigate(-1); // Navigate to the previous page
    };

    return (
        <div>
            <div className="row">
                <div className="offset-lg-3 col-lg-6">
                    <form className="container" onSubmit={handlesubmit}>
                        <div className="card" style={{ textAlign: "left" }}>
                            <div className="card-title">
                                <h2>Add Timeslot</h2>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div className="form-group">
                                            <label>Week</label>
                                            <input value={week} onChange={e => weekChange(parseInt(e.target.value))} className="form-control"></input>
                                        </div>
                                    </div>
                                    <div className="col-lg-12">
                                        <div className="form-group">
                                            <label>Date</label>
                                            <DatePicker selected={date} onChange={(date) => dateChange(date)} dateFormat="yyyy-MM-dd" className="form-control" />
                                        </div>
                                    </div>
                                    <div className="col-lg-12">
                                        <div className="form-group">
                                            <label>Start Time</label>
                                            <TimePicker value={startTime} onChange={startTimeChange} className="form-control" />
                                        </div>
                                    </div>
                                    <div className="col-lg-12">
                                        <div className="form-group">
                                            <label>End Time</label>
                                            <TimePicker value={endTime} onChange={endTimeChange} className="form-control" />
                                        </div>
                                    </div>
                                    <div className="col-lg-12">
                                        <div className="form-group">
                                            <label>Facility</label>
                                            <input value={facility} onChange={e => facilityChange(e.target.value)} className="form-control"></input>
                                        </div>
                                    </div>
                                    <div className="col-lg-12">
                                        <div className="form-group">
                                            <label>Rink</label>
                                            <input value={rink} onChange={e => rinkChange(e.target.value)} className="form-control"></input>
                                        </div>
                                    </div>
                                    <div className="col-lg-12">
                                        <div className="form-group">
                                            <label>Premium?</label>
                                            <div>
                                                <input type="radio" name="premium" value="true" checked={premium === true} onChange={() => premiumChange(true)} /> Yes
                                                <input type="radio" name="premium" value="false" checked={premium === false} onChange={() => premiumChange(false)} /> No
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <button type="submit" className="btn btn-primary" onClick={handleBack}>Submit</button>
                                    <button className="btn btn-success" type="button" onClick={handleBack}>Back</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default TimeSlotCreate;
