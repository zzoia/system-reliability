using System.Collections.Generic;
using ReliabilityModel.Model;

namespace ReliabilityModel.Api.Controllers
{
    public class PlotResponse
    {
        public string ModuleName { get; set; }

        public double FailureRate { get; set; }

        public IReadOnlyList<WorkingProbability> PlotData { get; set; }
    }
}
