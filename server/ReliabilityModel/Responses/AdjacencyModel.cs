using System.Collections.Generic;

namespace ReliabilityModel.Model.Responses
{
    public class AdjacencyModel
    {
        public SystemStateModel FromState { get; set; }

        public IEnumerable<SystemStateModel> ToStates { get; set; }
    }
}
