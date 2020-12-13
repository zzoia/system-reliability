using System.Collections.Generic;

namespace ReliabilityModel.Api.Models.Responses
{
    public class AdjacencyModel
    {
        public SystemStateModel FromState { get; set; }

        public IEnumerable<SystemStateTransitionModel> ToStates { get; set; }
    }
}
