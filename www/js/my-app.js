// Initialize your app
var myApp = new Framework7();

// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
});

// Callbacks to run specific code for specific pages, for example for About page:
myApp.onPageInit('about', function (page) {
    // run createContentPage func after link was clicked
    $$('.create-page').on('click', function () {
        createContentPage();
    });
});

myApp.onPageInit('dispute', function (page) {
    disputePreLoadValues();
});

myApp.onPageInit('loan', function (page) {
    myApp.confirm('Are you sure?', 'Start Loan Application', 
      function () {
        loanPreLoadValues();
      },
      function () {
        mainView.router.loadPage("index.html");
      }
    );
});

myApp.onPageInit('stolen', function (page) {
    stolenPreLoadValues();
});

myApp.onPageInit('ivrHome', function (page) {
    getIVRGreeting();
});

// Generate dynamic page
var dynamicPageIndex = 0;

function createContentPage() {
	mainView.router.loadContent(
        '<!-- Top Navbar-->' +
        '<div class="navbar">' +
        '  <div class="navbar-inner">' +
        '    <div class="left"><a href="#" class="back link"><i class="icon icon-back"></i><span>Back</span></a></div>' +
        '    <div class="center sliding">Dynamic Page ' + (++dynamicPageIndex) + '</div>' +
        '  </div>' +
        '</div>' +
        '<div class="pages">' +
        '  <!-- Page, data-page contains page name-->' +
        '  <div data-page="dynamic-pages" class="page">' +
        '    <!-- Scrollable page content-->' +
        '    <div class="page-content">' +
        '      <div class="content-block">' +
        '        <div class="content-block-inner">' +
        '          <p>Here is a dynamic page created on ' + new Date() + ' !</p>' +
        '          <p>Go <a href="#" class="back">back</a> or go to <a href="services.html">Services</a>.</p>' +
        '        </div>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>'
    );
	return;
}

// Profile Functions
function getProfile() {
    var acct = document.getElementById("accountNumber").value;
        
    //Build Host
    var host = "104.130.72.155";
    //var host = localStorage.getItem("host");
    host = "http://" + host + ":8888/func/v1/vht_customer_profile/get";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {"identifiers": {"account_number": acct}};
    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
        
    //Output
        
    xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        var output = JSON.parse(xmlhttp.responseText);
                        // Set Variables
                        createChannel("LOAN");
                        createChannel("DISPUTE");
                        createChannelNumber("CALLBACK");
                        createChannel("STOLEN");
                        createChannel("SMTP_EMAIL");
                        createChannelNumber("SMS_TWILIO");
                        createChannelNumber("BANK");
                        
                        var fname = output.results.data.first_name;
                        var lname = output.results.data.last_name;
                        var email = output.results.customer.email_address;
                        var number = output.results.customer.phone_number;
                        var twitter = output.results.customer.twitter_handle;
                        var account = output.results.customer.account_number;
                        var timeline = output.results.data.timeline;
                        var sheet = output.results.data.sheet;
                        
                        // Fill in Profile Form
                        if(fname){
                            document.getElementById("firstNameInput").value = fname;
                            sessionStorage.fname = fname;
                        }
                        if(lname){
                            document.getElementById("lastNameInput").value = lname; 
                            sessionStorage.lname = lname;
                        }
                        if(email){
                            document.getElementById("loginEmailInput").value = email;
                            sessionStorage.email = email;
                        }
                        if(number){
                            document.getElementById("phoneNumberInput").value = number;
                            sessionStorage.number = number;
                        }
                        if(twitter){
                            document.getElementById("twitterHandleInput").value = twitter;
                            sessionStorage.twitter = twitter;
                        }
                        if(account){
                            document.getElementById("accountNumberInput").value = account;
                            sessionStorage.account = account;
                        }
                        if(timeline){
                            document.getElementById("timelineURL").value = timeline;
                            sessionStorage.timeline = timeline;
                        }
                        if(sheet){
                            document.getElementById("sheetURL").value = sheet;
                            sessionStorage.sheet = sheet;
                        }
                        
                        mobileLoginTimelineEvent();                        
                        
                        // Output
                        myApp.alert('Found and Loaded', 'Profile', function () {
                               mainView.router.loadPage("index.html");
                            });
                    } else {
                        var output = JSON.parse(xmlhttp.responseText);
                        var errorOutput = JSON.stringify(output, undefined, 4);
                        myApp.alert('not found', 'Profile');
                    }
                }
            } 
    
}


// Generic Navigator Functions
function createChannel(name) {
    
    var contact = document.getElementById("accountNumber").value;
    
    //Build Host
    var host = "104.130.72.155";
    //var host = localStorage.getItem("host");
    host = "http://" + host + ":8888/func/v1/vht_customer_profile/add_channels";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {"identifiers": {"account_number": contact},
        "channels": [
        {
         "offer_treatments": [],
          "opt_out_date": null,
          "opt_in": true,
          "description": null,
          "name": name,
          "opt_in_once_data": null,
          "opt_in_expiration": null,
          "opt_in_date": null,
          "opt_in_once_date": null,
          "contact": contact,
		  "opt_out_data": null,
          "opt_in_data": { },
          "opt_in_once": null }
          ]
        };
    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
        
}

function createChannelNumber(name) {
    
    var contact = document.getElementById("accountNumber").value;
    var number = document.getElementById("phoneNumberInput").value;
    
    //Build Host
    var host = "104.130.72.155";
    //var host = localStorage.getItem("host");
    host = "http://" + host + ":8888/func/v1/vht_customer_profile/add_channels";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {"identifiers": {"account_number": contact},
        "channels": [
        {
         "offer_treatments": [],
          "opt_out_date": null,
          "opt_in": true,
          "description": null,
          "name": name,
          "opt_in_once_data": null,
          "opt_in_expiration": null,
          "opt_in_date": null,
          "opt_in_once_date": null,
          "contact": number,
		  "opt_out_data": null,
          "opt_in_data": { },
          "opt_in_once": null }
          ]
        };
    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
        
}

function genericEvent(name, channel, type){
    var eventName = name;
    var eventChannel = channel;
    var eventType = type;
    var country = getCountry();
    var state = getState();
    var fname = getFirstName();
    var lname = getLastName();
    var contact = getContact(fname, lname);
    
    //Build Host
    var host = "104.130.72.155";
    //var host = localStorage.getItem("host");
    host = "http://" + host + ":8888/event";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {
            "channel":{
            "type": eventChannel 
        },
        "events":[
            {
            "type": eventType, 
            "event_name": eventName, 
            "data":{ 
                "first_name" : fname,
                "last_name": lname,
                "country" : country,
                "state" : state
                }
            }
            ],
            "customer":{
                "email_address" : contact
            },
            "resources":[
                {
                "type":"LIST",
                    "data" : {
                        "language": "en"
                    }
                }
            ]
        };
    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
        
    //Output
        
    xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 202) {
                        var output = JSON.parse(xmlhttp.responseText);
                        var ID = output.correlation_id; 
                        document.getElementById("outputLabel1").innerHTML = "Event ID:\n";   
                        document.getElementById("outputLabel2").innerHTML = ID;       
                    } else {
                        var output = JSON.parse(xmlhttp.responseText);
                        var errorOutput = JSON.stringify(output.error.events[0], undefined, 4);
                        document.getElementById("outputLabel1").innerHTML = "Failed Event:";
                        document.getElementById("outputLabel2").innerHTML = errorOutput;     
                    }
                }
            }
          
}

function getState(){
    var state =["AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
    
    var max = state.length;
    var min = 0;
    var x = Math.random() * (max - min) + min;
    var num = Math.floor(x);
    
    var stateCode = state[num];
    
    return stateCode;
    
}

function getCountry(){
    var country =["AC","AD","AE","AF","AG","AI","AL","AM","AN","AO","AQ","AR","AS","AT","AU","AW","AX","AZ","BA","BB","BD","BE","BF","BG","BH","BI","BJ","BM","BN","BO","BR","BS","BT","BV","BW","BZ","CD","CN","CU","DE","CY","CZ","DZ","ES","EC","EU","EG","GE","GB","GG","FR","GU","JP","KW","MG","MX","NP","PA","PR","SA","SV","PT","TH","TR","TW","US","CA","CL","TD","DM","GR","IE","NZ","PK"];
    
    var max = country.length;
    var min = 0;
    var x = Math.random() * (max - min) + min;
    var num = Math.floor(x);
    
    var countryCode = country[num];
    
    return countryCode;
    
}

function getFirstName(){
    var firstName =["Scott", "Chad", "Jim", "Joe", "Amy", "Ericka", "Megan", "Mary", "John", "Eric", "Tony", "Toni", "Aaron", "Albert", "Allen", "Avery", "Billy", "Billie", "Bryan", "Chris", "Clair", "Danny", "Daniel", "Devin", "Devon", "Fred", "Harold", "Heather", "Jill", "Jack", "Jamie", "Nancy"];
        
    //Get First Name
    var max = firstName.length;
    var min = 0;
    var x = Math.random() * (max - min) + min;
    var num = Math.floor(x);
    var first_name = firstName[num];
    return first_name;
}

function getLastName(){
    var lastName =["Smith", "Johnson", "Williams", "Brown", "Davis", "Taylor", "Jackson", "Anderson", "Lewis", "Martin", "Clark", "Hall", "Walker", "Lee", "Brooks", "Wood", "Barnes", "Murphy", "Cooper", "Price", "Morris", "Butler", "Cole", "Harrison", "Reynolds", "Foster", "Long", "Ross", "Simpson", "Black", "Palmer", "Lane"];
    
    //Get Last Name
    var max = lastName.length;
    var min = 0;
    var x = Math.random() * (max - min) + min;
    var num = Math.floor(x);
    var last_name = lastName[num];
    return last_name;
}

function getContact(firstName, lastName) {
    var contact = firstName + "_" + lastName + "@demo.com";
    return contact;
}

// --------------------------------------------------------//
// VHT Banking Functions.
// Survey    
function bankScheduleSurvey() {
        
    var eventName = "bank_survey_start";
    var eventChannel = "web";
    var eventType = "action";
    var country = getCountry();
    var state = getState();
    var fname = document.getElementById("firstNameInput").value;
    var lname = document.getElementById("lastNameInput").value;
    var contact = document.getElementById("bankSurveyNumberInput").value;
    var number = document.getElementById("phoneNumberInput").value;
    
    //Build Host
    var host = "104.130.72.155";
    host = "http://" + host + ":8888/event";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {
            "channel":{
            "type": eventChannel 
        },
        "events":[
            {
            "type": eventType, 
            "event_name": eventName, 
            "data":{ 
                "first_name" : fname,
                "last_name": lname,
                "country" : country,
                "state" : state,
                "type" : "sms",
                "number" : contact
                }
            }
            ],
            "customer":{
                "phone_number" : number
            },
            "resources":[
                {
                "type":"LIST",
                    "data" : {
                        "language": "en"
                    }
                }
            ]
        };
    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
        
    //Output
        
    xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 202) {
                        var output = JSON.parse(xmlhttp.responseText);
                        myApp.alert('Survey has been scheduled for ' + contact, 'Survey', function () {
                                 
                               setTimeout(getBankSurveyID, 1000); 
                            });
                        
                    } else {
                        var output = JSON.parse(xmlhttp.responseText);
                        var errorOutput = JSON.stringify(output, undefined, 4);
                        myApp.alert('Survey not created for ' + contact, 'Survey');
                        //document.getElementById("outputLabel1").innerHTML = "SMS Survey not created";
                        //document.getElementById("outputLabel2").innerHTML = "for " + contact;
                    }
                }
            }   
}

function bankShowCompleteSection()  {
    document.getElementById("resultSection").style.display = "inline";
}

function bankSurveyCompleteEvent(){
    var eventName = "bank_survey_complete";
    var eventChannel = "web";
    var eventType = "action";
    var number = document.getElementById("phoneNumberInput").value;
    
    //Build Host
    var host = "104.130.72.155";
    host = "http://" + host + ":8888/event";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {
            "channel":{
            "type": eventChannel 
        },
        "events":[
            {
            "type": eventType, 
            "event_name": eventName, 
            "data":{  }
            }
            ],
            "customer":{
                "phone_number" : number
            },
            "resources":[
                {
                "type":"LIST",
                    "data" : {
                        "language": "en"
                    }
                }
            ]
        };
    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
        
    //Output
        
    xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 202) {
                        setTimeout(bankSurveyCompleteGet, 3000);
                    } else {
                        var output = JSON.parse(xmlhttp.responseText);
                        var errorOutput = JSON.stringify(output.error, undefined, 4);
                        document.getElementById("outputLabel1").innerHTML = errorOutput;
                    }
                }
            }
          
}

function bankSurveyCompleteGet(){
    var number = document.getElementById("phoneNumberInput").value;
    
    //Build Host
    var host = "104.130.72.155";
    host = "http://" + host + ":8888/func/v1/vht_customer_profile/get_channel";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {
              "identifiers": {
                "phone_number": number
              },
              "channel_name": "BANK"
            }    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
        
    //Output
        
    xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        var output = JSON.parse(xmlhttp.responseText);
                        document.getElementById("bankSurveyIDLabel").innerHTML = "Survey ID: " + output.results.opt_in_data.survey_id;
                        if(output.results.opt_in_data.response1 == "1"){
                            document.getElementById("bankAnswerOneLabel").innerHTML = "Yes";
                        }else {
                            document.getElementById("bankAnswerOneLabel").innerHTML = "No";
                        } 
                        document.getElementById("bankAnswerTwoLabel").innerHTML = output.results.opt_in_data.response2;
                        document.getElementById("bankAnswerThreeLabel").innerHTML = output.results.opt_in_data.response3;
                        document.getElementById("bankAnswerFourLabel").innerHTML = output.results.opt_in_data.response4;
                        
                        setTimeout(surveyCompleteTimeLineEvent, 1000);
                        
                    } else {
                        var output = JSON.parse(xmlhttp.responseText);
                        var errorOutput = JSON.stringify(output.error, undefined, 4);
                    }
                }
            }
          
}   

function getBankSurveyID() {
    var contact = document.getElementById("phoneNumberInput").value;
        
    //Build Host
    var host = "104.130.72.155";
    host = "http://" + host + ":8888/func/v1/vht_customer_profile/get_channel";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {
              "identifiers": {
                "phone_number": contact
              },
              "channel_name": "BANK"
            }    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
        
    //Output
        
    xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        var output = JSON.parse(xmlhttp.responseText);
                        document.getElementById("surveyIDLatest").value = output.results.opt_in_data.survey_id;
                        setTimeout(scheduleSurveyTimeLineEvent, 1000); 
                    } else {
                        var output = JSON.parse(xmlhttp.responseText);
                        var errorOutput = JSON.stringify(output.error, undefined, 4);
                        document.getElementById("surveyIDLatest").value = "";
                    }
                }
            }
}
    
// Loan Functions
function bankCancelLoanApp() {
    var name = document.getElementById("loanNameInput").value;
    var email = document.getElementById("loanEmailInput").value;
    var phone = document.getElementById("loanPhoneInput").value;
    var date = document.getElementById("loanDateInput").value;
    var income = document.getElementById("loanIncomeInput").value;
    var amount = document.getElementById("loanAmountInput").value;
    var contact = sessionStorage.email;
    
    if(!contact){
        document.getElementById("outputLabel1").innerHTML = "No Profile Found\n";   
        document.getElementById("outputLabel2").innerHTML = "Please Login";  
        return;       
    }
    
    //Build Host
    var host = "104.130.72.155";
    //var host = localStorage.getItem("host");
    host = "http://" + host + ":8888/event";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {
            "channel":{
            "type": "mobile" 
        },
        "events":[
            {
            "type": "action", 
            "event_name": "cancel_loan", 
            "data":{ 
                "name" : name,
                "email": email,
                "phone" : phone,
                "date" : date,
                "income" : income,
                "amount" : amount
                }
            }
            ],
            "customer":{
                "email_address" : contact
            },
            "resources":[
                {
                "type":"LIST",
                    "data" : {
                        "language": "en"
                    }
                }
            ]
        };
    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
        
    //Output
        
    xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 202) {
                        var output = JSON.parse(xmlhttp.responseText);
                        var ID = output.correlation_id; 
                        myApp.alert('Cancelled', 'Loan Application', function () {
                            mobileCancelLoanTimelineEvent();
                        });     
                    } 
                }
            }

}

function bankSubmitLoanApp() {
    var name = document.getElementById("loanNameInput").value;
    var email = document.getElementById("loanEmailInput").value;
    var phone = document.getElementById("loanPhoneInput").value;
    var date = document.getElementById("loanDateInput").value;
    var income = document.getElementById("loanIncomeInput").value;
    var amount = document.getElementById("loanAmountInput").value;
    var contact = sessionStorage.email;
    
    if(!name){
        bankIncompleteLoanEvent();
    }else if(!email){
        bankIncompleteLoanEvent();
    }else if(!phone){
        bankIncompleteLoanEvent();
    }else if(!date){
        bankIncompleteLoanEvent();
    }else if(!income) {
        bankIncompleteLoanEvent();
    }else if(!amount){
        bankIncompleteLoanEvent();
    }else {
        bankCompeletLoanEvent();
    }

}

function bankCompeletLoanEvent() {
    var name = document.getElementById("loanNameInput").value;
    var email = document.getElementById("loanEmailInput").value;
    var phone = document.getElementById("loanPhoneInput").value;
    var date = document.getElementById("loanDateInput").value;
    var income = document.getElementById("loanIncomeInput").value;
    var amount = document.getElementById("loanAmountInput").value;
    var contact = sessionStorage.email;
    
    //Build Host
    var host = "104.130.72.155";
    //var host = localStorage.getItem("host");
    host = "http://" + host + ":8888/event";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {
            "channel":{
            "type": "mobile" 
        },
        "events":[
            {
            "type": "transaction", 
            "event_name": "loan_submitted", 
            "data":{ 
                "name" : name,
                "email": email,
                "phone" : phone,
                "date" : date,
                "income" : income,
                "amount" : amount
                }
            }
            ],
            "customer":{
                "email_address" : contact
            },
            "resources":[
                {
                "type":"LIST",
                    "data" : {
                        "language": "en"
                    }
                }
            ]
        };
    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
        
    //Output
        
    xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 202) {
                        var output = JSON.parse(xmlhttp.responseText);
                        var ID = output.correlation_id; 
                        myApp.alert('Submitted', 'Loan Application', function () {
                            mobileCompleteLoanTimelineEvent();
                        });
                              
                    } 
                }
            }

}

function bankIncompleteLoanEvent() {
    var name = document.getElementById("loanNameInput").value;
    var email = document.getElementById("loanEmailInput").value;
    var phone = document.getElementById("loanPhoneInput").value;
    var date = document.getElementById("loanDateInput").value;
    var income = document.getElementById("loanIncomeInput").value;
    var amount = document.getElementById("loanAmountInput").value;
    var contact = sessionStorage.email;
    
    //Build Host
    var host = "104.130.72.155";
    //var host = localStorage.getItem("host");
    host = "http://" + host + ":8888/event";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {
            "channel":{
            "type": "mobile" 
        },
        "events":[
            {
            "type": "action", 
            "event_name": "loan_incomplete", 
            "data":{ 
                "name" : name,
                "email": email,
                "phone" : phone,
                "date" : date,
                "income" : income,
                "amount" : amount
                }
            }
            ],
            "customer":{
                "email_address" : contact
            },
            "resources":[
                {
                "type":"LIST",
                    "data" : {
                        "language": "en"
                    }
                }
            ]
        };
    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
        
    //Output
        
    xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 202) {
                        var output = JSON.parse(xmlhttp.responseText);
                        var ID = output.correlation_id; 
                        //myApp.alert('Submitted', 'Loan Application');
                        
                        myApp.alert('Submitted', 'Loan Application', function () {
                            mobileInCompleteLoanTimelineEvent();
                        });
                    } 
                }
            }
    
    

} 

function loanPreLoadValues() {
    var name = sessionStorage.fname + " " + sessionStorage.lname;
    document.getElementById("loanNameInput").value = name;
    
    document.getElementById("loanEmailInput").value = sessionStorage.email;
    document.getElementById("loanPhoneInput").value = sessionStorage.number;
    
    mobileStartLoanTimelineEvent();
}
    
// Charge Dispute Functions
function chargeDisputeEvent() {
    var name = document.getElementById("disputeNameInput").value;
    var email = document.getElementById("disputeEmailInput").value;
    var phone = document.getElementById("disputePhoneInput").value;
    var date = document.getElementById("disputeDateInput").value;
    var vendor = document.getElementById("disputeVendorInput").value;
    var amount = document.getElementById("disputeAmountInput").value;
    var contact = sessionStorage.email;
    
    //Build Host
    var host = "104.130.72.155";
    //var host = localStorage.getItem("host");
    host = "http://" + host + ":8888/event";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {
            "channel":{
            "type": "mobile" 
        },
        "events":[
            {
            "type": "action", 
            "event_name": "dispute_submitted", 
            "data":{ 
                "name" : name,
                "email": email,
                "phone" : phone,
                "date" : date,
                "vendor" : vendor,
                "amount" : amount
                }
            }
            ],
            "customer":{
                "email_address" : contact
            },
            "resources":[
                {
                "type":"LIST",
                    "data" : {
                        "language": "en"
                    }
                }
            ]
        };
    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
        
    //Output
        
    xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 202) {
                        var output = JSON.parse(xmlhttp.responseText);
                        mobileDisputeSubmittedTimelineEvent();
                        myApp.alert('Submitted', 'Charge Dispute', function () {
                               setTimeout(chargeDisputeGetTreatment, 3000); 
                            });
                          
                    } 
                }
            }

}

function chargeDisputeGetTreatment() {
    var name = document.getElementById("disputeNameInput").value;
    var email = document.getElementById("disputeEmailInput").value;
    var phone = document.getElementById("disputePhoneInput").value;
    var date = document.getElementById("disputeDateInput").value;
    var vendor = document.getElementById("disputeVendorInput").value;
    var amount = document.getElementById("disputeAmountInput").value;
    var contact = sessionStorage.email;
    
    //Build Host
    var host = "104.130.72.155";
    //var host = localStorage.getItem("host");
    host = "http://" + host + ":8888/func/v1/vht_customer_profile/get_offer_treatment";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {
  "identifiers": {"email_address": contact},
          "channel_name" : "DISPUTE",
          "offer_treatment_reason": "Charge Dispute Submitted"
        };
    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
        
    //Output
        
    xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        var output = JSON.parse(xmlhttp.responseText);
                        var offer = output.results[0].data.offer;
                        var action = output.results[0].action; 
                        sessionStorage.offer = offer;
                        sessionStorage.action = action;
                        
                        myApp.alert(offer, action, function () {
                            mobileDisputeUpdatedTimelineEvent();
                        }); 
                        
                    } 
                }
            }

}
    
function screenAcknowledged() {
    document.getElementById("messageWindow").style.display = "none";    
    document.getElementById("okButton").style.display = "none";  
    document.getElementById("okButton2").style.display = "inline";  
    
    
}

function closeDisputeMessage() {
    document.getElementById("messageWindow").style.display = "none";    
    document.getElementById("okButton").style.display = "inline";  
    document.getElementById("okButton2").style.display = "none"; 
    document.getElementById("offerReasonLabel").innerHTML = "";
    document.getElementById("offerActionLabel").innerHTML = "";
    document.getElementById("offerOfferLabel").innerHTML = "";    
}

function disputePageLoad() {
    setTimeout(disputePreLoadValues, 1000);    
}

function disputePreLoadValues() {
    var name = sessionStorage.fname + " " + sessionStorage.lname;
    document.getElementById("disputeNameInput").value = name;
    
    document.getElementById("disputeEmailInput").value = sessionStorage.email;
    document.getElementById("disputePhoneInput").value = sessionStorage.number;
}

function disputeSelectChange() {
    var select = document.getElementById("disputeChargeSelect").value;
    
    switch(select){
        case "1":
            document.getElementById("disputeDateInput").value = "2016-08-13";
            document.getElementById("disputeVendorInput").value = "Diner";
            document.getElementById("disputeAmountInput").value = "25.04";
            break;
        case "2":
            document.getElementById("disputeDateInput").value = "2016-08-12";
            document.getElementById("disputeVendorInput").value = "Gas Station";
            document.getElementById("disputeAmountInput").value = "14.54";
            break;
        case "3":
            document.getElementById("disputeDateInput").value = "2016-08-14";
            document.getElementById("disputeVendorInput").value = "Online";
            document.getElementById("disputeAmountInput").value = "65.32";
            break;
        case "4":
            document.getElementById("disputeDateInput").value = "2016-08-14";
            document.getElementById("disputeVendorInput").value = "Fast Food";
            document.getElementById("disputeAmountInput").value = "32.03";
            break;
        case "5":
            document.getElementById("disputeDateInput").value = "2016-08-13";
            document.getElementById("disputeVendorInput").value = "Store";
            document.getElementById("disputeAmountInput").value = "250.42";
            break;
        default:
            document.getElementById("disputeDateInput").value = "";
            document.getElementById("disputeVendorInput").value = "";
            document.getElementById("disputeAmountInput").value = "";
    }
    
}

function disputeCancelled() {
    mainView.router.loadPage("index.html");                
}

// Stolen/Lost Card Functions
function stolenPageLoad() {
    setTimeout(stolenPreLoadValues, 1000);    
}

function stolenPreLoadValues() {
    var name = sessionStorage.fname + " " + sessionStorage.lname;
    document.getElementById("stolenNameInput").value = name;
    
    document.getElementById("stolenEmailInput").value = sessionStorage.email;
    document.getElementById("stolenPhoneInput").value = sessionStorage.number;
    document.getElementById("stolenReplacementInput").checked;
}

function stolenCardEvent() {
    var name = document.getElementById("stolenNameInput").value;
    var email = document.getElementById("stolenEmailInput").value;
    var phone = document.getElementById("stolenPhoneInput").value;
    var date = document.getElementById("stolenDateInput").value;
    var typeCard = document.getElementById("stolenTypeInput").value;
    var replacement = document.getElementById("stolenReplacementInput").checked;
    var contact = sessionStorage.email;
    
    //Build Host
    var host = "104.130.72.155";
    //var host = localStorage.getItem("host");
    host = "http://" + host + ":8888/event";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {
            "channel":{
            "type": "mobile" 
        },
        "events":[
            {
            "type": "action", 
            "event_name": "stolenCard_event", 
            "data":{ 
                "name" : name,
                "email": email,
                "phone" : phone,
                "date" : date,
                "cardType" : typeCard,
                "replacement" : replacement
                }
            }
            ],
            "customer":{
                "email_address" : contact
            },
            "resources":[
                {
                "type":"LIST",
                    "data" : {
                        "language": "en"
                    }
                }
            ]
        };
    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
        
    //Output
        
    xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 202) {
                        var output = JSON.parse(xmlhttp.responseText);
                        
                        myApp.alert('Submitted', 'Stolen/Lost Card', function () {
                               setTimeout(stolenGetTreatment, 3000); 
                            });
                        //document.getElementById("messageWindow").style.height = "20%";
                        //document.getElementById("messageWindow").style.display = "inline";
                        //document.getElementById("offerReasonLabel").style.textAlign = "center";   
                        //document.getElementById("offerReasonLabel").innerHTML = "Dispute Charge Submitted";   
                    } 
                }
            }

}

function stolenGetTreatment() {
    var contact = sessionStorage.email;
    
    //Build Host
    var host = "104.130.72.155";
    //var host = localStorage.getItem("host");
    host = "http://" + host + ":8888/func/v1/vht_customer_profile/get_offer_treatment";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {
  "identifiers": {"email_address": contact},
          "channel_name" : "STOLEN",
          "offer_treatment_reason": "Stolen/Lost Card"
        };
    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
        
    //Output
        
    xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        var output = JSON.parse(xmlhttp.responseText);
                        var offer = output.results[0].data.offer;
                        var action = output.results[0].action; 
                        sessionStorage.action = action;
                        sessionStorage.offer = offer;
                        
                        myApp.alert(offer, action, function () {
                            mobileStolenTimelineEvent();
                        }); 
                    } 
                }
            }

}

function stolenCancel() {
    //mainView.router.reloadPreviousPage();
    mainView.router.loadPage("index.html");
                
}

// --------------------------------------------------------//
// VHT Survey Functions
function scheduleSurvey() {
    
    document.getElementById("resultSection").style.display = "none";
    
    var eventName = "survey_start";
    var eventChannel = "web";
    var eventType = "action";
    var country = getCountry();
    var state = getState();
    var fname = document.getElementById("firstNameInput").value;
    var lname = document.getElementById("lastNameInput").value;
    var contact = document.getElementById("surveyNumberInput").value;
    var phone = document.getElementById("phoneNumberInput").value;
    
    //Build Host
    var host = "104.130.72.155";
    host = "http://" + host + ":8888/event";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {
            "channel":{
            "type": eventChannel 
        },
        "events":[
            {
            "type": eventType, 
            "event_name": eventName, 
            "data":{ 
                "first_name" : fname,
                "last_name": lname,
                "country" : country,
                "state" : state,
                "type" : "sms",
                "number" : contact
                }
            }
            ],
            "customer":{
                "phone_number" : phone
            },
            "resources":[
                {
                "type":"LIST",
                    "data" : {
                        "language": "en"
                    }
                }
            ]
        };
    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
        
    //Output
        
    xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 202) {
                        var output = JSON.parse(xmlhttp.responseText);
                        var x  = "Scheduled for " + contact;
                        myApp.alert(x, 'SMS Survey', function () { 
                            setTimeout(getSurveyID, 1000);
                        });
                        
                    } else {
                        var output = JSON.parse(xmlhttp.responseText);
                        var errorOutput = JSON.stringify(output, undefined, 4);
                        var x  = "Not scheduled for " + contact;
                        myApp.alert(x, 'SMS Survey', function () { 
                            
                        });
                    }
                }
            }   
}

function showCompleteSection()  {
    document.getElementById("resultSection").style.display = "inline";
    document.getElementById("outputLabel1").innerHTML = "";
    document.getElementById("outputLabel2").innerHTML = "";
    
    
}

function surveyCompleteEvent(){
    var eventName = "survey_complete";
    var eventChannel = "web";
    var eventType = "action";
    var phone = document.getElementById("phoneNumberInput").value;
    
    //Build Host
    var host = "104.130.72.155";
    host = "http://" + host + ":8888/event";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {
            "channel":{
            "type": eventChannel 
        },
        "events":[
            {
            "type": eventType, 
            "event_name": eventName, 
            "data":{  }
            }
            ],
            "customer":{
                "phone_number" : phone
            },
            "resources":[
                {
                "type":"LIST",
                    "data" : {
                        "language": "en"
                    }
                }
            ]
        };
    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
        
    //Output
        
    xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 202) {
                        document.getElementById("outputLabel1").innerHTML = "Please wait";
                        setTimeout(surveyCompleteGet, 3000);
                    } else {
                        var output = JSON.parse(xmlhttp.responseText);
                        var errorOutput = JSON.stringify(output.error, undefined, 4);
                        document.getElementById("outputLabel1").innerHTML = errorOutput;
                    }
                }
            }
          
}

function surveyCompleteGet(){
    var number = document.getElementById("phoneNumberInput").value;
    
    //Build Host
    var host = "104.130.72.155";
    host = "http://" + host + ":8888/func/v1/vht_customer_profile/get_channel";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {
              "identifiers": {
                "phone_number": '1234567890'
              },
              "channel_name": "BANK"
            }    
    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
        
    //Output
        
    xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        var output = JSON.parse(xmlhttp.responseText);
                        document.getElementById("outputLabel1").innerHTML = "Survey Found.";
                        document.getElementById("outputLabel2").innerHTML = "";
                        document.getElementById("surveyIDLabel").innerHTML = "Survey ID: " + output.results.opt_in_data.survey_id;
                        if(output.results.opt_in_data.response1 == "1"){
                            document.getElementById("answerOneLabel").innerHTML = "Response One: Yes";
                        }else {
                            document.getElementById("answerOneLabel").innerHTML = "Response One: No";
                        } 
                        document.getElementById("answerTwoLabel").innerHTML = "Response Two: " + output.results.opt_in_data.response2;
                        document.getElementById("answerThreeLabel").innerHTML = "Response Three: " + output.results.opt_in_data.response3;
                        document.getElementById("answerFourLabel").innerHTML = "Response Four: " + output.results.opt_in_data.response4;
                    } else {
                        var output = JSON.parse(xmlhttp.responseText);
                        var errorOutput = JSON.stringify(output.error, undefined, 4);
                        document.getElementById("outputLabel1").innerHTML = errorOutput;
                    }
                }
            }
          
}

function playIVRGreeting() {
    var content1 = document.getElementById("ivrGreeting1").innerHTML;
    var content2 = document.getElementById("ivrGreeting2").innerHTML;
    var content3 = document.getElementById("ivrGreeting3").innerHTML;
    
    var content1a = content1.replace(/<br>/gi, "");
    var content2a = content2.replace(/<br>/gi, "");
    var content3a = content3.replace(/<br>/gi, "");
    
    document.getElementById("ivrContentA").value = content1a;
    document.getElementById("ivrContentB").value = content2a;
    document.getElementById("ivrContentC").value = content3a;
     
    responsiveVoice.setDefaultVoice("US English Female");    
    responsiveVoice.speak(content1a + ",  " + content2a + ", " + content3a);
        
    setTimeout(ivrTimeLineEvent, 2000);
}

function getIVRGreeting() {
    var fname = document.getElementById("firstNameInput").value;
    var lname = document.getElementById("lastNameInput").value;
    
    var contact = sessionStorage.email;
    
    //Build Host
    var host = "104.130.72.155";
    //var host = localStorage.getItem("host");
    host = "http://" + host + ":8888/func/v1/vht_customer_profile/get_and_take_offer_treatment";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {
  "identifiers": {"email_address": contact},
        "channel_name" : "BANK",
        "reason":"Survey Greeting",
        "offer_treatment_reason": "Survey Greeting"
        };
    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
        
    //Output
        
    xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        var output = JSON.parse(xmlhttp.responseText);
                        var offer = output.results.data.offer;
                        document.getElementById("ivrGreeting1").innerHTML = "Thank you for contacting VHT Bank IVR " + fname + ".";
                        document.getElementById("ivrGreeting2").innerHTML = offer;
                        
                        getLastBankEvent();
                    } else {
                        document.getElementById("ivrGreeting1").innerHTML = "Thank you for contacting VHT Bank IVR " + fname + ".";
                        getLastBankEvent();                        
                    }
                }
            }


}

function getLastBankEvent() {
    var fname = document.getElementById("firstNameInput").value;
    var lname = document.getElementById("lastNameInput").value;
    
    var contact = sessionStorage.email;
    
    //Build Host
    var host = "104.130.72.155";
    //var host = localStorage.getItem("host");
    host = "http://" + host + ":8888/func/v1/vht_customer_profile/get_and_take_offer_treatment";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {
  "identifiers": {"email_address": contact},
        "channel_name" : "BANK",
        "reason":"Event Greeting",
        "offer_treatment_reason": "Event Greeting"
        };
    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
        
    //Output
        
    xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        var output = JSON.parse(xmlhttp.responseText);
                        var offer = output.results.data.offer;
                        document.getElementById("ivrGreeting3").innerHTML = offer;
                        playIVRGreeting();
                    } else {
                        playIVRGreeting();
                    }
                }
            }


}

function getSurveyID() {
        
    //Build Host
    var host = "104.130.72.155";
    host = "http://" + host + ":8888/func/v1/vht_customer_profile/get_channel";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {
              "identifiers": {
                "phone_number": "1234567890"
              },
              "channel_name": "BANK"
            }    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
        
    //Output
        
    xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        var output = JSON.parse(xmlhttp.responseText);
                        document.getElementById("surveyIDLatest").innerHTML = output.results.opt_in_data.survey_id;
                        setTimeout(scheduleSurveyTimeLineEvent, 1000); 
                    } else {
                        var output = JSON.parse(xmlhttp.responseText);
                        var errorOutput = JSON.stringify(output.error, undefined, 4);
                        document.getElementById("surveyIDLatest").innerHTML = "";
                    }
                }
            }
}


// --------------------------------------------------------//
// VHT Timeline functions.
// Login 
function mobileLoginTimelineEvent() {
    // Variables        
    var fullname = document.getElementById("firstNameInput").value + " " + document.getElementById("lastNameInput").value;
    var phone = document.getElementById("phoneNumberInput").value;
    var email = document.getElementById("loginEmailInput").value;
    var account = document.getElementById("accountNumberInput").value;
    
    var eventName = "mobile_timeline";
    var eventChannel = "nav";
    var eventType = "action";
    var contact = document.getElementById("phoneNumberInput").value;
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var mins = date.getMinutes();
    var time = hour + ":" + mins + ":00";
    var headline = "Logged into Mobile Application";
    var text = "Logged in with Account Number: " + account + "<br />Name: " + fullname + "<br />Email: " + email + "<br />Phone: " + phone;
    var thumbnail = "http://navigatordemo.com/jskaraus/Phone Filled-50.png";
    var background = "#979696";
    var URL = document.getElementById("sheetURL").value;
    
    //Build Host
    var host = "104.130.72.155";
    host = "http://" + host + ":8888/event";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {
            "channel":{
            "type": eventChannel 
        },
        "events":[
            {
            "type": eventType, 
            "event_name": eventName, 
            "data":{ 
                "Year" : year,
                "Month": month,
                "Day" : day,
                "Time" : time,
                "Headline" : headline,
                "Text" : text,
                "Media_Thumbnail" : thumbnail,
                "Background" : background,
                "URL" : URL
                }
            }
            ],
            "customer":{
                "phone_number" : contact
            },
            "resources":[
                {
                "type":"LIST",
                    "data" : {
                        "language": "en"
                    }
                }
            ]
        };
    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
        
}

function mobileStartLoanTimelineEvent() {
    // Variables        
    var fullname = document.getElementById("firstNameInput").value + " " + document.getElementById("lastNameInput").value;
    var phone = document.getElementById("phoneNumberInput").value;
    var email = document.getElementById("loginEmailInput").value;
    var account = document.getElementById("accountNumberInput").value;
    
    var eventName = "mobile_timeline";
    var eventChannel = "nav";
    var eventType = "action";
    var contact = document.getElementById("phoneNumberInput").value;
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var mins = date.getMinutes();
    var time = hour + ":" + mins + ":00";
    var headline = "Started Loan Application via Mobile Application";
    var text = "Loan Applications Started.<br />Name: " + fullname + "<br />Email: " + email + "<br />Phone: " + phone;
    var thumbnail = "http://navigatordemo.com/jskaraus/Phone Filled-50.png";
    var background = "#979696";
    var URL = document.getElementById("sheetURL").value;
    
    //Build Host
    var host = "104.130.72.155";
    host = "http://" + host + ":8888/event";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {
            "channel":{
            "type": eventChannel 
        },
        "events":[
            {
            "type": eventType, 
            "event_name": eventName, 
            "data":{ 
                "Year" : year,
                "Month": month,
                "Day" : day,
                "Time" : time,
                "Headline" : headline,
                "Text" : text,
                "Media_Thumbnail" : thumbnail,
                "Background" : background,
                "URL" : URL
                }
            }
            ],
            "customer":{
                "phone_number" : contact
            },
            "resources":[
                {
                "type":"LIST",
                    "data" : {
                        "language": "en"
                    }
                }
            ]
        };
    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
        
}

function mobileCancelLoanTimelineEvent() {
    // Variables        
    var fullname = document.getElementById("loanNameInput").value;
    var phone = document.getElementById("loanPhoneInput").value;
    var email = document.getElementById("loanEmailInput").value;
    var date = document.getElementById("loanDateInput").value;
    var amount = document.getElementById("loanAmountInput").value;
    var income = document.getElementById("loanIncomeInput").value;
    
    var eventName = "mobile_timeline";
    var eventChannel = "nav";
    var eventType = "action";
    var contact = document.getElementById("phoneNumberInput").value;
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var mins = date.getMinutes();
    var time = hour + ":" + mins + ":00";
    var headline = "Cancelled Loan Application via Mobile Application";
    var text = "Loan Applications Cancelled.<br />Collected Information:<br />Name: " + fullname + "<br />Email: " + email + "<br />Phone: " + phone + "<br />Date: " + date + "<br />Income: " + income + "<br />Amount: " + amount;
    var thumbnail = "http://navigatordemo.com/jskaraus/Phone Filled-50.png";
    var background = "#979696";
    var URL = document.getElementById("sheetURL").value;
    
    //Build Host
    var host = "104.130.72.155";
    host = "http://" + host + ":8888/event";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {
            "channel":{
            "type": eventChannel 
        },
        "events":[
            {
            "type": eventType, 
            "event_name": eventName, 
            "data":{ 
                "Year" : year,
                "Month": month,
                "Day" : day,
                "Time" : time,
                "Headline" : headline,
                "Text" : text,
                "Media_Thumbnail" : thumbnail,
                "Background" : background,
                "URL" : URL
                }
            }
            ],
            "customer":{
                "phone_number" : contact
            },
            "resources":[
                {
                "type":"LIST",
                    "data" : {
                        "language": "en"
                    }
                }
            ]
        };
    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
    
    mainView.router.loadPage("index.html");
                                    
}

function mobileCompleteLoanTimelineEvent() {
    // Variables        
    var fullname = document.getElementById("loanNameInput").value;
    var phone = document.getElementById("loanPhoneInput").value;
    var email = document.getElementById("loanEmailInput").value;
    var date = document.getElementById("loanDateInput").value;
    var amount = document.getElementById("loanAmountInput").value;
    var income = document.getElementById("loanIncomeInput").value;
    
    var eventName = "mobile_timeline";
    var eventChannel = "nav";
    var eventType = "action";
    var contact = document.getElementById("phoneNumberInput").value;
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var mins = date.getMinutes();
    var time = hour + ":" + mins + ":00";
    var headline = "Completed Loan Application via Mobile Application";
    var text = "Loan Applications Completed.<br />Collected Information:<br />Name: " + fullname + "<br />Email: " + email + "<br />Phone: " + phone + "<br />Date: " + date + "<br />Income: " + income + "<br />Amount: " + amount;
    var thumbnail = "http://navigatordemo.com/jskaraus/Phone Filled-50.png";
    var background = "#979696";
    var URL = document.getElementById("sheetURL").value;
    
    //Build Host
    var host = "104.130.72.155";
    host = "http://" + host + ":8888/event";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {
            "channel":{
            "type": eventChannel 
        },
        "events":[
            {
            "type": eventType, 
            "event_name": eventName, 
            "data":{ 
                "Year" : year,
                "Month": month,
                "Day" : day,
                "Time" : time,
                "Headline" : headline,
                "Text" : text,
                "Media_Thumbnail" : thumbnail,
                "Background" : background,
                "URL" : URL
                }
            }
            ],
            "customer":{
                "phone_number" : contact
            },
            "resources":[
                {
                "type":"LIST",
                    "data" : {
                        "language": "en"
                    }
                }
            ]
        };
    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
    
    mainView.router.loadPage("index.html");
                                    
}

function mobileInCompleteLoanTimelineEvent() {
    // Variables        
    var fullname = document.getElementById("loanNameInput").value;
    var phone = document.getElementById("loanPhoneInput").value;
    var email = document.getElementById("loanEmailInput").value;
    var date = document.getElementById("loanDateInput").value;
    var amount = document.getElementById("loanAmountInput").value;
    var income = document.getElementById("loanIncomeInput").value;
    
    var eventName = "mobile_timeline";
    var eventChannel = "nav";
    var eventType = "action";
    var contact = document.getElementById("phoneNumberInput").value;
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var mins = date.getMinutes();
    var time = hour + ":" + mins + ":00";
    var headline = "Incomplete Loan Application via Mobile Application";
    var text = "Loan Applications Incomplete.<br />Collected Information:<br />Name: " + fullname + "<br />Email: " + email + "<br />Phone: " + phone + "<br />Date: " + date + "<br />Income: " + income + "<br />Amount: " + amount;
    var thumbnail = "http://navigatordemo.com/jskaraus/Phone Filled-50.png";
    var background = "#979696";
    var URL = document.getElementById("sheetURL").value;
    
    //Build Host
    var host = "104.130.72.155";
    host = "http://" + host + ":8888/event";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {
            "channel":{
            "type": eventChannel 
        },
        "events":[
            {
            "type": eventType, 
            "event_name": eventName, 
            "data":{ 
                "Year" : year,
                "Month": month,
                "Day" : day,
                "Time" : time,
                "Headline" : headline,
                "Text" : text,
                "Media_Thumbnail" : thumbnail,
                "Background" : background,
                "URL" : URL
                }
            }
            ],
            "customer":{
                "phone_number" : contact
            },
            "resources":[
                {
                "type":"LIST",
                    "data" : {
                        "language": "en"
                    }
                }
            ]
        };
    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
    
    mainView.router.loadPage("index.html");
                                        
}

function mobileDisputeSubmittedTimelineEvent() {
    // Variables        
    var fullname = document.getElementById("disputeNameInput").value;
    var phone = document.getElementById("disputePhoneInput").value;
    var email = document.getElementById("disputeEmailInput").value;
    var date = document.getElementById("disputeDateInput").value;
    var amount = document.getElementById("disputeAmountInput").value;
    var vendor = document.getElementById("disputeVendorInput").value;
    
    var eventName = "mobile_timeline";
    var eventChannel = "nav";
    var eventType = "action";
    var contact = document.getElementById("phoneNumberInput").value;
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var mins = date.getMinutes();
    var time = hour + ":" + mins + ":00";
    var headline = "Charge Dispute Submitted";
    var text = "Charge Dispute Submitted via Mobile Applications.<br />Name: " + fullname + "<br />Phone: " + phone + "<br />Email: " + email + "<br />Date: " + date + "<br />Amount: " + amount + "<br />Vendor: " + vendor;
    var thumbnail = "http://navigatordemo.com/jskaraus/Phone Filled-50.png";
    var background = "#979696";
    var URL = document.getElementById("sheetURL").value;
    
    //Build Host
    var host = "104.130.72.155";
    host = "http://" + host + ":8888/event";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {
            "channel":{
            "type": eventChannel 
        },
        "events":[
            {
            "type": eventType, 
            "event_name": eventName, 
            "data":{ 
                "Year" : year,
                "Month": month,
                "Day" : day,
                "Time" : time,
                "Headline" : headline,
                "Text" : text,
                "Media_Thumbnail" : thumbnail,
                "Background" : background,
                "URL" : URL
                }
            }
            ],
            "customer":{
                "phone_number" : contact
            },
            "resources":[
                {
                "type":"LIST",
                    "data" : {
                        "language": "en"
                    }
                }
            ]
        };
    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
    
    mainView.router.loadPage("index.html");
                                            
}

function mobileDisputeUpdatedTimelineEvent() {
    // Variables        
    var fullname = document.getElementById("disputeNameInput").value;
    var phone = document.getElementById("disputePhoneInput").value;
    var email = document.getElementById("disputeEmailInput").value;
    var date = document.getElementById("disputeDateInput").value;
    var amount = document.getElementById("disputeAmountInput").value;
    var vendor = document.getElementById("disputeVendorInput").value;
    var action = sessionStorage.action;
    var offer = sessionStorage.offer;
    
    var eventName = "mobile_timeline";
    var eventChannel = "nav";
    var eventType = "action";
    var contact = document.getElementById("phoneNumberInput").value;
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var mins = date.getMinutes();
    var time = hour + ":" + mins + ":00";
    var headline = "Charge Dispute Updated";
    var text = "Charge Dispute Updated.<br />Name: " + fullname + "<br />Phone: " + phone + "<br />Email: " + email + "<br />Date: " + date + "<br />Amount: " + amount + "<br />Vendor: " + vendor + "<br />Action: " + action + "<br />Response: " + offer;
    var thumbnail = "http://navigatordemo.com/jskaraus/Phone Filled-50.png";
    var background = "#979696";
    var URL = document.getElementById("sheetURL").value;
    
    //Build Host
    var host = "104.130.72.155";
    host = "http://" + host + ":8888/event";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {
            "channel":{
            "type": eventChannel 
        },
        "events":[
            {
            "type": eventType, 
            "event_name": eventName, 
            "data":{ 
                "Year" : year,
                "Month": month,
                "Day" : day,
                "Time" : time,
                "Headline" : headline,
                "Text" : text,
                "Media_Thumbnail" : thumbnail,
                "Background" : background,
                "URL" : URL
                }
            }
            ],
            "customer":{
                "phone_number" : contact
            },
            "resources":[
                {
                "type":"LIST",
                    "data" : {
                        "language": "en"
                    }
                }
            ]
        };
    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
                                                
}

function mobileStolenTimelineEvent() {
    // Variables        
    var fullname = document.getElementById("stolenNameInput").value;
    var phone = document.getElementById("stolenEmailInput").value;
    var email = document.getElementById("stolenPhoneInput").value;
    var date = document.getElementById("stolenDateInput").value;
    var stolen = document.getElementById("stolenTypeInput").value;
    var replacement = document.getElementById("stolenReplacementInput").value;
    var action = sessionStorage.action;
    var offer = sessionStorage.offer;
    
    if(stolen == "stolen"){
        var stolen1 = "Stolen";
    } else {
        var stolen1 = "Lost";
    }
    
    var eventName = "mobile_timeline";
    var eventChannel = "nav";
    var eventType = "action";
    var contact = document.getElementById("phoneNumberInput").value;
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var mins = date.getMinutes();
    var time = hour + ":" + mins + ":00";
    var headline = stolen1 + " Card Submitted.";
    var text = "Name: " + fullname + "<br />Phone: " + phone + "<br />Email: " + email + "<br />Date: " + date + "<br />Type: " + stolen1 + "<br />Replacement Card: " + replacement + "<br />Action: " + action + "<br />Response: " + offer;
    var thumbnail = "http://navigatordemo.com/jskaraus/Phone Filled-50.png";
    var background = "#979696";
    var URL = document.getElementById("sheetURL").value;
    
    //Build Host
    var host = "104.130.72.155";
    host = "http://" + host + ":8888/event";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {
            "channel":{
            "type": eventChannel 
        },
        "events":[
            {
            "type": eventType, 
            "event_name": eventName, 
            "data":{ 
                "Year" : year,
                "Month": month,
                "Day" : day,
                "Time" : time,
                "Headline" : headline,
                "Text" : text,
                "Media_Thumbnail" : thumbnail,
                "Background" : background,
                "URL" : URL
                }
            }
            ],
            "customer":{
                "phone_number" : contact
            },
            "resources":[
                {
                "type":"LIST",
                    "data" : {
                        "language": "en"
                    }
                }
            ]
        };
    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
                                             
    mainView.router.loadPage("index.html");
}

function scheduleSurveyTimeLineEvent() {
    // Variables        
    var id = document.getElementById("surveyIDLatest").value;
    var eventName = "sched_timeline_event";
    var eventChannel = "nav";
    var eventType = "action";
    var contact = document.getElementById("phoneNumberInput").value;
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var mins = date.getMinutes();
    var time = hour + ":" + mins + ":00";
    var headline = "Bank Survey Scheduled";
    var text = "Bank Survey was scheduled via Mobile Application with ID: " + id;
    var thumbnail = "http://navigatordemo.com/jskaraus/survey.png";
    var background = "#2C8D0B";
    var URL = document.getElementById("sheetURL").value;
    
    //Build Host
    var host = "104.130.72.155";
    host = "http://" + host + ":8888/event";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {
            "channel":{
            "type": eventChannel 
        },
        "events":[
            {
            "type": eventType, 
            "event_name": eventName, 
            "data":{ 
                "Year" : year,
                "Month": month,
                "Day" : day,
                "Time" : time,
                "Headline" : headline,
                "Text" : text,
                "Media_Thumbnail" : thumbnail,
                "Background" : background,
                "URL" : URL
                }
            }
            ],
            "customer":{
                "phone_number" : contact
            },
            "resources":[
                {
                "type":"LIST",
                    "data" : {
                        "language": "en"
                    }
                }
            ]
        };
    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
        
        
}

function color(score) {
    var x = score;
    var color = "#FFFFFF";
    
    switch(x) {
        case "3":
            color = "yellow";
            break;
        case "2":
            color = "red";
            break;
        case "1":
            color = "red";
            break;
        default:
            color = "#FFFFFF";
            break;
    }
    
    return color;
}

function surveyCompleteTimeLineEvent() {
    // Variables        
    var id = document.getElementById("bankSurveyIDLabel").innerHTML;
    // Responses
    var fcr = "No";
    var num1 = document.getElementById("bankAnswerOneLabel").innerHTML;
    if(num1 == "1"){
        fcr = "Yes";
    }
    var num2 = document.getElementById("bankAnswerTwoLabel").innerHTML;
    var num3 = document.getElementById("bankAnswerThreeLabel").innerHTML;
    var num4 = document.getElementById("bankAnswerFourLabel").innerHTML;
    
    
    // Colors
    if(num1 == "Yes"){
        var color1 = "white";      
    } else {
        var color1 = "red";
    }
    var color2 = color(num2);
    var color3 = color(num3);
    var color4 = color(num4);
    
    // Event Info
    var eventName = "survey_results_update";
    var eventChannel = "nav";
    var eventType = "action";
    var contact = document.getElementById("phoneNumberInput").value;
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var mins = date.getMinutes();
    var time = hour + ":" + mins + ":00";
    var headline = "Bank Survey Results";
    var text = "<blockquote><ul><li>Survey ID: " + id + "</li><li style='color:" + color1 + "'>First Contact Resolution:  " + num1 + "</li><li style='color:" + color2 + "'>Net Promoter Score NPS: " + num2 + "</li><li style='color:" + color3 + "'>Agent Knowledge Level: " + num3 + "</li><li style='color:" + color4 + "'>Customer Satisfaction Level CSAT: " + num4 + "</li></ul></blockquote>";
    var thumbnail = "http://navigatordemo.com/jskaraus/survey.png";
    var background = "#2C8D0B";
    var URL = document.getElementById("sheetURL").value;
    
    //Build Host
    var host = "104.130.72.155";
    host = "http://" + host + ":8888/event";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {
            "channel":{
            "type": eventChannel 
        },
        "events":[
            {
            "type": eventType, 
            "event_name": eventName, 
            "data":{ 
                "Year" : year,
                "Month": month,
                "Day" : day,
                "Time" : time,
                "Headline" : headline,
                "Text" : text,
                "Media_Thumbnail" : thumbnail,
                "Background" : background,
                "URL" : URL
                }
            }
            ],
            "customer":{
                "phone_number" : contact
            },
            "resources":[
                {
                "type":"LIST",
                    "data" : {
                        "language": "en"
                    }
                }
            ]
        };
    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
        
}

function ivrTimeLineEvent() {
    // Variables  
    var treatmentA = document.getElementById("ivrContentA").value;
    var treatmentB = document.getElementById("ivrContentB").value;
    var treatmentC = document.getElementById("ivrContentC").value;
        
    // Event Info
    var eventName = "mobile_timeline";
    var eventChannel = "nav";
    var eventType = "action";
    var contact = document.getElementById("phoneNumberInput").value;
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var mins = date.getMinutes();
    var time = hour + ":" + mins + ":00";
    var headline = "Called IVR Results";
    var text = "IVR Treatments played:<br />" + treatmentA + "<br /><br />" + treatmentB + "<br /><br />" + treatmentC ;
    var thumbnail = "http://navigatordemo.com/jskaraus/phone.png";
    var background = "#8D270B";
    var URL = document.getElementById("sheetURL").value;
    
    //Build Host
    var host = "104.130.72.155";
    host = "http://" + host + ":8888/event";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', host, true);
            
    // build REST request
    var sr = {
            "channel":{
            "type": eventChannel 
        },
        "events":[
            {
            "type": eventType, 
            "event_name": eventName, 
            "data":{ 
                "Year" : year,
                "Month": month,
                "Day" : day,
                "Time" : time,
                "Headline" : headline,
                "Text" : text,
                "Media_Thumbnail" : thumbnail,
                "Background" : background,
                "URL" : URL
                }
            }
            ],
            "customer":{
                "phone_number" : contact
            },
            "resources":[
                {
                "type":"LIST",
                    "data" : {
                        "language": "en"
                    }
                }
            ]
        };
    
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(sr));
        
}







