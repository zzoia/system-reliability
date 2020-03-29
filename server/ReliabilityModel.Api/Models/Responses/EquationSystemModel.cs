using ReliabilityModel.Model.Responses;
using System.Collections.Generic;

namespace ReliabilityModel.Api.Models.Responses
{
    public class EquationSystemModel
    {
        public IReadOnlyList<List<double>> Coefficients { get; set; }

        public IEnumerable<SystemStateModel> SystemStates{ get; set; }
    }
}
