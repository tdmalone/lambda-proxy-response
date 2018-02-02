
'use strict';

const HTTP_OK = 200,
      HTTP_SERVER_ERROR = 500,
      CI = process.env.CI; // eslint-disable-line no-process-env

/**
 * Finishes off an incoming API Gateway Lambda proxy request by responding with a valid API Gateway
 * response object, depending on whether the request succeeded or an issue was encountered.
 *
 * Currently assumes all issues are server issues (i.e. HTTP status code 500) unless an error
 * object supplies an alternative statusCode.
 *
 * If running in a CI environment (env var CI is truthy), errors will be thrown rather than
 * returned in an API Gateway style response, so that the exit code is correct. This works well
 * when testing with lambci/docker-lambda.
 *
 * Errors and responses are also logged to the console. This works well when utilising tools to
 * watch and alert on your Lambda CloudWatch logs - such as tdmalone/cloudwatch-to-papertrail.
 *
 * @param {mixed}    error    The error encountered during processing of the request. Could be a
 *                            string, an object, or an Error - or null if no error occurred.
 * @param {mixed}    response The response received from external services while processing. Could
 *                            be a string, an object, an array... or null if an error occurred.
 * @param {function} callback Function to call to report completion.
 * @return {undefined}
 * @see https://docs.aws.amazon.com/apigateway/latest/developerguide/handle-errors-in-lambda-integration.html
 */
module.exports = ( error, response, callback ) => {

  const apiResponse = {
    isBase64Encoded: false,
    headers:         {},
    statusCode:      error ? ( error.statusCode || HTTP_SERVER_ERROR ) : HTTP_OK,
    body:            error ? ( error.message || error ) : response
  };

  const logFunction = error ? console.error : console.log;
  logFunction( error ? 'Error: ' + error : response );
  logFunction( apiResponse );
  callback( error && CI ? error : null, apiResponse );

}; // Module.exports.
