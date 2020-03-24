namespace ReliabilityModel.Model.Requests
{
    public class SingleModuleSystemRequest : SystemRequest
    {
        public string ModuleName { get; set; }

        public double RecoveryRate { get; set; }
    }
}