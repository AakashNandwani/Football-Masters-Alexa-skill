// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const skillData = require('skillData.js');
const persistenceAdapter = require('ask-sdk-s3-persistence-adapter');
var index;
var score = 0
var chanceleft = 2
var flag = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var count=0


const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {
        const data = getLocalizedData(handlerInput.requestEnvelope.request.locale);
        console.log(data);
        let speakOutput = "";
        const prompt = data["QUESTION"];
        score=0
        chanceleft=2

        let persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
        console.log(persistentAttributes.FIRST_TIME);
        
        if(persistentAttributes.FIRST_TIME === undefined){
            const dataToSave = {
                "FIRST_TIME": false
            }
            speakOutput = data["WELCOME_MESSAGE"]+ data["QUESTION"];
            const attributesManager = handlerInput.attributesManager; 
            attributesManager.setPersistentAttributes(dataToSave);
            await attributesManager.savePersistentAttributes();

        } else {
            speakOutput = data["RETURNING_USERS_WELCOME"] + data["QUESTION"];
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(prompt)
            .getResponse();
    }
};

function getLocalizedData(locale){
    return skillData[locale];
}

const QuizIntentHandler = {
    canHandle(handlerInput) {
        return (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'QuizIntent') || 
            (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent') ;
    },
    handle(handlerInput) {
        
        let speakOutput = '';
        
        if(count === 27){
            speakOutput = 'Great ! You have completed the game. You finished with '+score+' points. Thank you for playing. Goodbye!';
            return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt(speakOutput)
            .getResponse();
        }

        speakOutput = 'Here goes a question. ';
        const data = getLocalizedData(handlerInput.requestEnvelope.request.locale);
        //index = Math.floor(Math.random()*31)+1
        
         while(true)
            {
                index=Math.floor((Math.random()*30)+1);
                if(flag[index]>-1)
                {
                    break;
                }
            }
            
        
        // Homework : Find the number of the current day and get the corresponding question. 
        const speechOutput = speakOutput + data["QUESTIONS"][index];
        
        flag[index]=-1

        const dataToSave = {
            "RIGHT_ANSWER": data["ANSWERS"][index]
        }
        handlerInput.attributesManager.setSessionAttributes(dataToSave);

        const reprompt = data["QUESTIONS"][index] + " " + data["ANSWER_MESSAGE"];
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(reprompt)
            .getResponse();
    }
};


const AnswerIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AnswerIntent';
    },
    handle(handlerInput) {
        const data = getLocalizedData(handlerInput.requestEnvelope.request.locale);

        const userAnswer = handlerInput.requestEnvelope.request.intent.slots.answer.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const correctAnswer = sessionAttributes.RIGHT_ANSWER;
        count=count+1

        let speakOutput = '';

        if(correctAnswer === userAnswer){
            score+=1
            speakOutput = "Correct Answer. You get "+ score+ " points. Would you like to continue?";
            return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
        } else {
            chanceleft=chanceleft-1
            if(chanceleft === 0){
                speakOutput = "Wrong Answer. The correct answer is "+correctAnswer+". You have no chances remaining. You finished with "+score+" points. Thank you for playing. Goodbye!"
                return handlerInput.responseBuilder
                .speak(speakOutput)
                //.reprompt(speakOutput)
                .getResponse();
            }
            else{
            speakOutput = "Wrong Answer. The correct answer is "+correctAnswer+". You have "+ chanceleft+ " chances remaining. Would you like to continue?"
            return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
            }
        }


        //return handlerInput.responseBuilder
          //  .speak(speakOutput)
            //.reprompt(speakOutput)
            //.getResponse();
    }
};


const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'I am going to ask you a question and you have to answer just by saying either of a, b, c or d. You will get 2 chances to score as much as possible. Would you like to continue? ';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent' 
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'You finished with '+score+' points. Thank you for playing. Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .withPersistenceAdapter(
        new persistenceAdapter.S3PersistenceAdapter({bucketName: process.env.S3_PERSISTENCE_BUCKET})
    )
    .addRequestHandlers(
        LaunchRequestHandler,
        QuizIntentHandler,
        AnswerIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();