using System.Collections.Generic;
using ReliabilityModel.Api.Models.Requests;

namespace ReliabilityModel.Api.Models.Responses
{
    public class SystemStateModel
    {
        public int Index { get; set; }

        public SystemStateStatus Status { get; set; }

        public IEnumerable<ModuleStateModel> ModuleStates { get; set; }
    }
}
