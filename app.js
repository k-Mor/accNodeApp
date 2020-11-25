/**
 * Copyright [2020] [Kaleb Moreno]

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

 * 
 * @author Kaleb Moreno
 * @version 11/14/2020
 * @description - This file holds all of the code for a simple Node app that grabs data from a database
 * and sends an HTTP POST request to a web api.
 */

// For easier HTTP requests
const axios = require('axios'),
    
    // For easier line reading relative to Node's native methods
    lineReader = require('line-reader'); 



/**
 * This is the main function that acts as the main method for the program,
 * It gets data from a text file that never changes and is regularly spit out by
 * a MS Access DB. Then, it send that newly created Array from the raw data to a method
 * that converts the Array into Objects. That Array of Objects is then sent to a remote 
 * API for distribution.
 * 
 * This program will only work if the following two condition are true:
 * 1. The file never moves 
 * 2. The format of the file never changes 
 */
function init() {

    //  DO ALL THIS AT SOME REGULAR INTERVAL!!
    const apiURL = 'https://bjsapi.herokuapp.com/'; // Personal API deployed to Heroku
    const filePath = 'accruals-bak.txt'; // The path to that text file to be converted

    // Getting the data from the text files
    getData(filePath, (response) => {

        // Convert the data into JSON objects
        convertData(response, (finalData) => {

            // Send the data to the API
            sendData(apiURL, finalData);

        });
    });
};

/**
 * The purpose of this function is to take the file to be parsed, 
 * and a callback with which to return that parsed data.
 * 
 * @param { String } theFile - The file to be parsed
 * @param { Callback } callback - The callback function that will hold the return data
 */
const getData = (theFile, callback) => {
    
    // Will contain all of the data from the parsed file
    let jpArray = [];

    // A counter for file manipulation 
    let i = 0;

    // Opening the file for reading and manipulation
    lineReader.open(theFile, (err, reader) => {
        if (err) throw err;
        
        // This loop continues until the end of the file
        while (reader.hasNextLine()) {

            reader.nextLine((err, line) => {
                if (err) throw err;

                i++;
                
                // Ignoring the lines that have erroneous data 
                if (i % 3 > 0) {

                    // Getting rid of the ' - AM' portion of the line
                    const cutLine = line.substring(0, line.length - 5); 
                    
                    // Capturing the 'AM' portion of a line for testing
                    const splicedString = line.substring(line.length - 2, line.length);

                    // Checking for AM session jackpots
                    if ( splicedString === 'AM') {
                        jpArray.push('AM');
                        jpArray.push(cutLine);
                        
                    // Checking for PM session jackpots
                    } else if (splicedString === 'PM') {
                        jpArray.push('PM');  
                        jpArray.push(cutLine);
                        
                    // Checking for Moon Light session jackpots
                    } else if (splicedString === 'ML') {
                        jpArray.push('ML');
                        jpArray.push(cutLine);

                    // None session jackpots are then pushed into the Array
                    } else {
                        jpArray.push(line);
                        
                    };
                };
            });
        };
        
        // The file is closed for reading
        reader.close(function(err) {
            if (err) throw err;
        });

        // returning the data to the passed callback
        return callback(jpArray);
    });
};

/**
 * The purpose of this function is to create objects from the Array data passed to it.
 * Then it returns that data to the passed callback.
 * 
 * @param { Array } theRawData - The Array containing all of the data to be converted 
 * @param { Callback } callback  - The callback with which to return the objects
 */
const convertData = (theRawData, callback) => {

    // The session times
    let times = ['AM', 'PM', 'ML'];

    // The Array that will hold the newly created objects
    let processedObjects = [];
    
    // Iterating over the Array
    for (let i = 0; i < theRawData.length - 1; i++) {

        if (times.includes(theRawData[i])) { // If is a session.. 
            
            processedObjects.push({ 
                session: theRawData[i],  // Capture that session
                name: theRawData[i + 1], // Capture the JP name
                value: theRawData[i + 2] }); // Capture the JP value
            
            // To move the index past the newly created object data
            i += 2;

        } else {
            
            processedObjects.push({ 
                name: theRawData[i],  // Capture the name of the JP
                value: theRawData[i + 1] }); // Capture the value 

            // To move the counter past the newly created object
            i++;
        };   
    };

    // Returning the Array of objects
    return callback(processedObjects);
};

/**
 * This method sends the Array of Objects to a remote 
 * API that then distributes the data.
 * 
 * @param { String } theAPI - The API to send the data
 * @param { Array[Object] } theJSONData - The new JSON data created 
 */
const sendData = async (theAPI, theJSONData) => {
    // console.log(theAPI)
    let formattedData = JSON.stringify(theJSONData);
    console.log(formattedData);

    // const res = await axios.post(theAPI, formattedData); // The API
    // console.log(res.data);
};

// Starting the application 
init();