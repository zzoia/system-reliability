using System.Collections.Generic;
using ReliabilityModel.Api.Models.Requests;

namespace ReliabilityModel.Api.Models.Responses
{
    public class SystemStateModel
    {
        public SystemStateStatus Status { get; set; }

        public IEnumerable<ModuleStateModel> ModuleStates { get; set; }
    }
}
