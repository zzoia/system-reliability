using ReliabilityModel.Model.Requests;

namespace ReliabilityModel.Api.Controllers
{
    public class PlotRequest
    {
        public string ModuleName { get; set; }

        public double[] FailureRates { get; set; }

        public double FromTime { get; set; }

        public double ToTime { get; set; }

        public double Step { get; set; }

        public HybridSystemRequest HybridSystemRequest { get; set; }
    }
}
