import * as helpers from "./helpers";

// -------------------------------------------------------------------------
// Configure all options in the two dictionaries `runtime_options` and
// `reservation_optiions`.
//
// [runtime_options]:
//   This dict lets you set some options for when you want this reservation bot
//   to run. For instance, if reservations for a restaurant open at a specific
//   time, you can set the RUN_DATE and RUN_TIME to match the date and time a 
//   reservation wiil be released at. If a reservation fails, it will retry for
//   how ever many times is stated in RETRIES.
// <params>
//   RUN_DATE: string -> Desired run date for bot ("YYYY-MM-DD")
//   RUN_TIME: string -> Desired run time for bot ("YYYY-MM-DD")
//   RETRIES: int -> Number of times to retry booking if the first try fails
//
//   
// [reservation_options]:
//   This dict lets you specify the actual reservation options. Double check
//   you enter them correctly!
// <params>
//   RESTAURANT_NAME: string -> Name of restaurant as it appears on Resy
//   BOOKING_DATE: string -> Desired date of reservation ("YYYY-MM-DD")
//   BOOKING_TIME: string -> Desired time of reservation ("HH:mm AM/PM")
//   NUMBER_OF_GUESTS: int -> Number of guests for reservation
// -------------------------------------------------------------------------

// const runtime_options = {
//     RUN_DATE: "2024-02-06",
//     RUN_TIME: "9:00 AM",
//     RETRIES: 5
// }
const runtime_options = {
    'RUN_DATE': "2024-02-06",
    'RUN_TIME': "9:00 AM",
    'RETRIES': 5
}


const reservation_options = {
    'RESTAURANT_NAME': "Armitage Alehouse",
    'BOOKING_DATE': "2024-02-20",
    'BOOKING_TIME': "6:15 PM",
    'NUMBER_OF_GUESTS': 2
}

// -------------------------------------------------------------------------

// Create the delay to run the bot at the scheduled time in `runtime_options`
const timeout = helpers.create_timeout(runtime_options)
// Schedules the bot using the timeout
setTimeout(run, timeout)


async function run() {

    const client = new helpers.ResyRevenge()

    await client.book_reservation(
        reservation_options['RESTAURANT_NAME'], 
        reservation_options['BOOKING_DATE'],
        reservation_options['BOOKING_TIME'],
        reservation_options['NUMBER_OF_GUESTS']
    )
}
