using ReliabilityModel.Model.Enums;

namespace ReliabilityModel.Api.Models.Requests
{
    public class HybridSystemRequest
    {
        public ModuleType Type { get; set; }

        public ReliabilityDependency? Dependency { get; set; }

        public HybridSystemRequest[] Members { get; set; }

        public string ModuleName { get; set; }

        public double FailureRate { get; set; }

        public double RecoveryRate { get; set; }

        public int Left { get; set; }
    }
}
