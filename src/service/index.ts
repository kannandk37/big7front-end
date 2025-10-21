import axios from "axios";

const axiosinstance = axios.create({
    baseURL: 'http://localhost:5000',

    timeout: 9000,
    headers: {
        "Access-Control-Allow-Origin": "http://localhost:8080",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Header":
            "Origin, Content-Type, X-Requested-With, Accept, Access-Control-Allow-Credentials, Access-Control-Allow-Headers, Access-Control-Allow-Origin",
        "Access-Control-Allow-Methods": "POST,GET,OPTIONS,PUT,DELETE",
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

// Add a request interceptor
axiosinstance.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token
        }
        return config;
    },
    (error) => {
        Promise.reject(error);
    }
);

export default axiosinstance;


import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
// import { HttpErrorHandler } from '../../errorhandler/http';
// import { AuthenticationEventBus } from "@/account/event/authentication";
import { environment } from "@/environments/environment";
import { session } from "@/app/business/session";
import { events } from "@/core/event/bus";
import { config } from "@/config";
import { Error } from "@/core/entity/error";

export class CommonHttpInterceptor {
  interceptableAPIs: string[] = [];
  interceptableAPIModules = config.interceptableAPIModules;

  constructor() {
    this.interceptableAPIModules?.forEach((module) => {
      let port = environment.api[module].port;
      this.interceptableAPIs.push(
        environment.api[module].scheme +
        "://" +
        environment.api[module].host +
        (port ? ":" + port : "")
      );
    });
  }

  async sessionAuthorization() {
    let token: string
    switch (config.account.token) {
      case "AccessToken": {
        token = await session.token();
      }
        break;
      case "IdToken": {
        token = await session.idToken()
      }
        break;
    }
    let authorizationHeaderPrefix = config.account?.authorization?.header?.prefix
    let authorization = (authorizationHeaderPrefix ? (authorizationHeaderPrefix + " ") : "") + token
    return authorization
  }

  updateAuthorizationToConfig(authorization: string, config: AxiosRequestConfig) {
    if (config.headers && typeof config.headers.set === 'function') {
      //@ts-ignore
      config.headers.set('Authorization', authorization)
    } else {
      (config.headers as any) = {
        ...config.headers,
        'Authorization': authorization
      }
    }
  }

  setup() {

    axios.interceptors.request.use(
      (value) => {
        return new Promise(async (resolve, reject) => {
          try {
            if (value.headers && typeof value.headers.set === 'function') {
              //@ts-ignore
              value.headers.set('API-Key', environment.api.default["API-Key"])
            } else {
              (value.headers as any) = {
                ...value.headers,
                'API-Key': environment.api.default["API-Key"]
              }
            }
          } catch (error) {
            reject(error)
          }
          resolve(value);
        });
      },
      (error: any) => {
        console.error(error)
        return Promise.reject(error)
      }
    );
    
    axios.interceptors.request.use(
      (value) => {
        return new Promise(async (resolve, reject) => {
          if (
            this.interceptableAPIs.find((api: string, index, obj) => {
              return value.url?.startsWith(api);
            })
          ) {
            let authorization = await this.sessionAuthorization()
            this.updateAuthorizationToConfig(authorization, value)
            resolve(value);
          } else {
            resolve(value);
          }
        });
      },
      (error: any) => {
        console.error(error)
        return Promise.reject(error)
      }
    );

    axios.interceptors.response.use(
      (value: AxiosResponse) => {
        return value;
      },
      async (requestError: AxiosError) => {
        console.log(Object.keys(requestError))
        console.log(JSON.stringify(requestError.request, null, 5))
        console.log(JSON.stringify(requestError, null, 5))
        if (
          requestError.request.responseType === 'blob' &&
          requestError.response.data instanceof Blob &&
          requestError.response.data.type &&
          requestError.response.data.type.toLowerCase().indexOf('json') != -1
        ) {
          requestError.response.data = JSON.parse(await requestError.response.data.text())
        }
        //@ts-ignore
        if ((requestError.response && requestError.response.status == 401 && requestError.response.data.resource == "token" && requestError.response.data.issue == "invalid")||(requestError?.response && requestError?.response?.status == 401 && requestError?.response?.data?.success == false)) {
          console.log("Access Token has expired")
          let refresher;
          if (config.account.authorization) {
            refresher = config.account.authorization.refresher
          }
          if (refresher) {
            console.log("Trying to get new Access Token using Refresh token")
            return new Promise<AxiosResponse<any>>(async (resolve, reject) => {
              try {
                await refresher()
                let authorization = await this.sessionAuthorization()
                this.updateAuthorizationToConfig(authorization, requestError.config)
                let retriedResponse = await axios.request(requestError.config)
                resolve(retriedResponse)
              } catch (refreshError: any) {
                if (axios.isAxiosError(refreshError)) {
                  let refreshErrorData = refreshError.response?.data
                  if (refreshErrorData) {
                    if (
                      refreshErrorData.domain
                      && refreshErrorData.resource
                      && refreshErrorData.issue
                      && refreshErrorData.field) {
                      let error = new Error(refreshErrorData.domain, refreshErrorData.resource, refreshErrorData.field, refreshErrorData.issue)
                      if (
                        error.resource == "authorization"
                        && error.field == "refreshtoken"
                        && error.issue == "expired"
                      ) {
                        console.log("refresh token api has failed due to " + JSON.stringify(error, null, 5))
                        if (!(await session.expired())) {
                          await session.persistAccountExpireStatus(true);
                          events.emit("session.expired")
                        }
                        else {
                          events.emit("session.expired")
                        }
                      }
                      if (
                        error.resource == "account"
                        && error.field == "refreshtoken"
                        && error.issue == "notfound"
                      ) {
                        console.log("refresh token api has failed due to " + JSON.stringify(error, null, 5))
                        if (!(await session.expired())) {
                          await session.persistAccountExpireStatus(true);
                          events.emit("session.expired")
                        }
                        else {
                          events.emit("session.expired")
                        }
                      }
                      if (
                        error.resource == 'token',
                        error.field == 'refreshtoken',
                        error.issue == 'notfound'
                      ) {
                        console.log("refresh token api has failed due to " + JSON.stringify(error, null, 5))
                        if (!(await session.expired())) {
                          await session.persistAccountExpireStatus(true);
                          events.emit("session.expired")
                        }
                        else {
                          events.emit("session.expired")
                        }
                      }
                    }
                  }
                }
                else {
                  events.emit("error", refreshError.response?.data);
                }
              }
            })
          }
          else {
            if (
              !(await session.expired())
              && !requestError.config?.url.includes("user/users/me")
              && !requestError.config?.url.includes("profile/profiles/me")
            ) {
              await session.persistAccountExpireStatus(true);
              events.emit("session.expired")
            }
          }
        }
        else if (requestError.response.status == 422) {
          events.emit("error", requestError.response.data)
        }
        else if (requestError.response.status == 417) {
          events.emit("error", requestError.response.data)
        }
        else if (requestError.response.status >= 500) {
          events.emit("error", "Internal server error")
        } else {
          events.emit("error", requestError?.message?.toString())
        }
        return Promise.reject(requestError)
      }
    );
  }
}
