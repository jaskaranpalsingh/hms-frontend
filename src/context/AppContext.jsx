import React, { createContext, useState, useContext, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);

    // Fetch patients and appointments on load
    useEffect(() => {
        const fetchData = async () => {
            try {
                const patRes = await fetch('http://localhost:9090/api/patients');
                const patData = await patRes.json();
                setPatients(Array.isArray(patData) ? patData : []);

                const aptRes = await fetch('http://localhost:9090/api/appointments');
                const aptData = await aptRes.json();
                setAppointments(Array.isArray(aptData) ? aptData : []);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    const addPatient = async (newPatient) => {
        try {
            const now = new Date();
            const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            const res = await fetch('http://localhost:9090/api/patients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newPatient, time })
            });
            const savedPatient = await res.json();
            setPatients([savedPatient, ...patients]);
        } catch (error) {
            console.error("Error adding patient:", error);
        }
    };

    const addAppointment = async (newAppointment) => {
        try {
            const res = await fetch('http://localhost:9090/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAppointment)
            });
            const savedAppointment = await res.json();
            setAppointments([savedAppointment, ...appointments]);
        } catch (error) {
            console.error("Error adding appointment:", error);
        }
    };

    return (
        <AppContext.Provider value={{
            patients,
            addPatient,
            appointments,
            addAppointment
        }}>
            {children}
        </AppContext.Provider>
    );
};
