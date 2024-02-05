import WebDriver from "webdriver";
import 'dotenv/config'

require('dotenv').config()

class ResyRevenge {
    constructor() {
        this.client = this._create_client();
    }

    async book_reservation(restaurant_name, booking_date, booking_time, num_of_guests) {
        /*
        The main function of ResyRevenge. Will create a booking and send an SMS
        confirmation to the provided number in the .env file.

        <param restaurant_name: string> The restaurant name as it appears on
            Resy. If the name is incorrect, an invalid address will be created.
        <param bookinig_date: string> The desired date of the reservation in the
            formt Resy uses in its URL [YYYY-MM-DD]. (ex: 2024-02-14). Note
            some restaurant may not let you book too far in advance.
        <param booking_time: string> The desired time for the reservation in
            12 hour time format [HH:mm AM/PM]. (ex: 8:15 PM). 
            
            [[ Verify the time you input is a valid time this restaurant offers 
            as a reservation time. ]]
        <param num_of_guests: int | strnig> Desiired number of guests for the
            reservation. Keep in mind for large parties, maximum party size for
            restaurants can vary.
        <return: bool> `True` if booking was a success.
        */

        // Sign into Resy using env vars
        let booked = false
        this._sign_in_to_resy();

        // Create URL using params
        let book_url = this._create_url(restaurant_name, booking_date, num_of_guests);
        (await this.client).navigateTo(book_url)
        console.log(`Navigated to: [${book_url}]`)

        // Booking a reservation does not navigate you to a new page (if it did,
        //  booking a reservation would be easier beacuse you could just straight
        //  line to that specific url), it opens an overlay pop up that must be
        //  navigated to with `clicks`, similar to the login process.
        
        // Find all available reservation buttons.
        let buttons = (await this.client).findElements('class',
            "ReservationButton Button Button--primary"
        )
        console.log(`Found [${(await buttons).length()}] available reservations.`)
        
        // Save the desired reservation button if found
        let reserve_button;
        for (let button of buttons) {
            if (button.getText() == booking_time) {
                reserve_button = button
                console.log(`Reservation Available for [${booking_time}]`)
                break
            }
        }
        
        if (reserve_button == null) {
            console.log(
                `No reservation found for [${booking_time}] on 
                [${booking_date}]. Please try again later or with new 
                parameters.`
            )
            return booked
        }
        
        // Click the reservation button
        (await this.client).elementClick(reserve_button)
        
        // Find and click the confirmation button
        let confirm_button_1 = (await this.client).findElement('class',
            "Button Button--primary Button--lg"
        )
        (await this.client).elementClick(confirm_button_1)

        // There will be another confiirm button after pressing the first time
        let confirm_button_2 = (await this.client).findElement('class',
            "Button Button--double-confirm Button--lg"
        )
        (await this.client).elementClick(confirm_button_2)

    }

    async _create_client() {
        let c = await WebDriver.newSession({
            capabilities: {
                browserName: 'chrome',
                platformName: 'Windows 10'
            }
        });
        return c;
    }

    async _sign_in_to_resy() {
        /*
        Takes in a WebDriver client and uses .env vars to sign in.
        Will return `True` if sign in is successful.
    
        <return: bool>
        */

        // Resy does not have a dedicated login page, it uses an overlay window
        //  that must me navigated to with traditional clicks
        try {
            (await this.client).navigateTo(`https://resy.com/`);
        
            // Find the login button
            let login_button = (await this.client).findElement('class',
                "Button Button--login"
            )
            (await this.client).elementClick(login_button)

            // By default, the login is with a phone number, but there is the option
            //  to use email/pass instead. The button to switch to that has no class,
            //  so all buttons must be pulled and each text must be checked.
            let buttons = (await this.client).findElements('type', 'button')

            let email_pass_button;
            for (let button of buttons) {
                if (button.getText() == "Use Email and Password instead") {
                    email_pass_button = button
                }
            }

            if (email_pass_button == null) { return false }
            
            // Switch to login with email and password instead of phone number
            (await this.client).elementClick(email_pass_button)

            // Find the email and password enter fields
            let email_enter = (await this.client).findElements('id', 'email')
            let pw_enter = (await this.client).findElements('id', 'password')

            // Enter in the user and pass
            (await this.client).elementSendKeys(email_enter, process.env.RESY_USER)
            (await this.client).elementSendKeys(pw_enter, process.env.RESY_PASS)

            // Find and click the continue button
            let continue_button = (await this.client).findElement('class',
                "Button Button--primary Button--lg"
            )
            (await this.client).elementClick(continue_button)
        } catch(err) {
            console.error(err)
            console.error("Failed to sign in.")
            return false
        }
        
        return true
    }

    _create_url(restaurant_name, booking_date, num_of_guests) {
        let res_name = restaurant_name.toLowerCase().split(" ").join("-");
        let url = `https://resy.com/cities/chi/${res_name}?date=${booking_date}&seats=${num_of_guests}`;
        return url;
    }
}

function create_timeout(runtime_options) {
    // splits date string into -> [YYYY, MM, DD]
    let run_date_parts = runtime_options['RUN_DATE'].split("-");
    run_date_parts.map(Number);

    // splits time string into -> [HH, mm, "AM/PM"]
    let run_time_parts = runtime_options['RUN_TIME'].split(/:| /);
    run_time_parts[0] = Number(run_time_parts[0]);
    run_time_parts[1] = Number(run_time_parts[1]);
    if (run_time_parts[2] == "PM") { run_time_parts[0] += 12; }

    let start_time = new Date(
        run_date_parts[0],
        run_date_parts[1],
        run_date_parts[2],
        run_time_parts[0],
        run_time_parts[1],
    );

    let timeout = start_time.getTime() - Date.now();
    return timeout;
}

export { ResyRevenge, create_timeout }
