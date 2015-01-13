using ButterflyCore.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace ButterflyCore
{
    public sealed class Client
    {
        private readonly string youtubeUrl = "http://gdata.youtube.com/feeds/api/users/omfgcata/uploads?v=2&alt=jsonc"; 
        private readonly string twitchUrl = "https://api.twitch.tv/kraken/streams/shaboozey.json";
        private readonly string cooptionalUrl = "https://api.twitch.tv/kraken/streams/totalbiscuit.json";
        private readonly string coxncrendorUrl = "";

        public Client()
        {
            
        }

        #region Base requests and utilities

        private HttpWebRequest CreateGetRequest(string url)
        {
            var req = WebRequest.CreateHttp(url);
            req.Method = "GET";

            return req;
        }

        private async Task<HttpWebRequest> CreatePostRequest(string url, object reqObject)
        {
            var req = WebRequest.CreateHttp(url);
            req.Method = "POST";

            //Write parameters to post stream
            if (reqObject != null)
            {
                //Do not apply contenttype header unless object exists
                req.ContentType = "application/json";

                using (var stream = await req.GetRequestStreamAsync())
                {
                    //Get and write bytes
                    var bytes = Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(reqObject));
                    await stream.WriteAsync(bytes, 0, bytes.Length);
                }
            }

            return req;
        }

        private async Task<CommonWebResponse<x>> HandleResponse<x>(HttpWebRequest req) where x : new()
        {
            var output = new CommonWebResponse<x>()
            {
                IsUnauthorized = false,
                Success = false,
                Message = "Could not finish HandleResponse<x>"
            };

            //Prep a generic object to hold our data object when deserialized
            var genData = new x();

            var deserializer = new Action<string>((json) =>
            {
                genData = JsonConvert.DeserializeObject<x>(json);
            });

            //Get baseresponse 
            var baseResponse = await HandleBaseResponse(req, deserializer);

            //Match properties of baseresponse to output
            output.IsUnauthorized = baseResponse.IsUnauthorized;
            output.Message = baseResponse.Message;
            output.Success = baseResponse.Success;

            //Pass generic data back to output
            output.Data = genData;

            return output;
        }

        private async Task<CommonWebResponse> HandleBaseResponse(HttpWebRequest req, Action<string> deserializeAction = null)
        {
            var output = new CommonWebResponse()
            {
                IsUnauthorized = false,
                Success = false,
                Message = "Could not finish HandleResponse"
            };

            //Try to get response
            HttpWebResponse resp = null;
            try
            {
                resp = await req.GetResponseAsync() as HttpWebResponse;
            }
            catch (WebException e)
            {
                output.Message = e.Message;
                resp = e.Response as HttpWebResponse;
            }

            if (resp != null)
            {
                using (resp)
                {
                    if (resp.StatusCode == HttpStatusCode.Unauthorized)
                    {
                        output.IsUnauthorized = true;
                    }
                    if (resp.StatusCode != HttpStatusCode.OK)
                    {
                        output.Message = "Response status code did not indicate success. Status Code: \{resp.StatusCode}.";
                    }
                    else
                    {
                        //Execute deserializer
                        if (deserializeAction != null)
                        {
                            //Read responseStream to object
                            using (var stream = resp.GetResponseStream())
                            {
                                using (var reader = new StreamReader(stream))
                                {
                                    deserializeAction(await reader.ReadToEndAsync());
                                }
                            }
                        }

                        //If we got here, success
                        output.Success = true;
                    }
                }
            }

            return output;
        }

        #endregion

        #region Requests

        public async Task<CommonWebResponse<GetYouTubeUploadsResult>> GetYouTubeUploads(int maxVideos = 10)
        {
            //Create request
            var req = CreateGetRequest(youtubeUrl + "&max-results=\{maxVideos}");

            //Handle response to determine success
            return await HandleResponse<GetYouTubeUploadsResult>(req);
        }

        public async Task<CommonWebResponse<GetTwitchStatusResponse>> GetTwitchStatus()
        {
            //Create request
            var req = CreateGetRequest(twitchUrl);

            //Handle response to determine success
            return await HandleResponse<GetTwitchStatusResponse>(req);
        }

        public async Task<CommonWebResponse<GetTwitchStatusResponse>> GetCooptionalStatus()
        {
            //Create request
            var req = CreateGetRequest(cooptionalUrl);

            //Handle response to determine success
            return await HandleResponse<GetTwitchStatusResponse>(req);
        }

        #endregion 
    }
}
