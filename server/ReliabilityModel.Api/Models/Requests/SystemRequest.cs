namespace ReliabilityModel.Api.Models.Requests
{
    public abstract class SystemRequest
    {
        public abstract Model.System.System ToSystem();
    }
}