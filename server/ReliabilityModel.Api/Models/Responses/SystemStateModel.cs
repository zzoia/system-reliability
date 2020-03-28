using ReliabilityModel.Model.Requests;
using System.Collections.Generic;

namespace ReliabilityModel.Model.Responses
{
    public class SystemStateModel
    {
        public SystemStateStatus Status { get; set; }

        public IEnumerable<ModuleStateModel> ModuleStates { get; set; }
    }
}
