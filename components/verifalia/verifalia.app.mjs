import {
  VerifaliaRestClient,
  RequestThrottledError,
  InsufficientCreditError,
  AuthorizationError,
} from "verifalia";

export default {
  type: "app",
  app: "verifalia",
  propDefinitions: {},
  methods: {
    // Common logic required to build a Verifalia client. We may need to change the auth method
    // in the future (by way of a bearer token, for example), so it makes sense to abstract the
    // actual client creation here.
    buildVerifaliaRestClient() {
      return new VerifaliaRestClient({
        username: this.$auth.username,
        password: this.$auth.password,
      });
    },

    // Call the specified function and trap specific exceptions, with the aim of providing more
    // user-friendly error messages.
    async wrapVerifaliaApiInvocation(fn) {
      try {
        return await fn();
      } catch (error) {
        if (error instanceof RequestThrottledError) {
          throw new Error("The request has been throttled, please try again later or adjust the throttling rules " +
                        "for this Verifalia user in your Verifalia dashboard (https://verifalia.com/client-area#/users).");
        }

        if (error instanceof InsufficientCreditError) {
          throw new Error("The Verifalia account balance is too low to complete the operation: to add credits to " +
                        "your Verifalia account please visit https://verifalia.com/client-area#/credits/add");
        }

        if (error instanceof AuthorizationError) {
          throw new Error("Your Verifalia credentials are invalid or you don't have enough permissions to complete " +
                        "the operation.");
        }

        throw error;
      }
    },

    // Return true if the expression is a valid time span value.
    isValidTimeSpan(expression) {
      return expression && /^(\d+\.)?(\d+):(\d+):(\d+)$/gm.test(expression);
    },
  },
};
