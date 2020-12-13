namespace ReliabilityModel.Api.Models.Responses
{
    public class ModuleStateModel
    {
        public string Name { get; set; }

        public bool IsWorking { get; set; }

        public int? Left { get; set; }
    }
}
