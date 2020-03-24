using System.Collections.Generic;

namespace ReliabilityModel.Model.Responses
{
    public class SystemStateModel
    {
        public string Status { get; set; }

        public IEnumerable<ModuleStateModel> ModuleStates { get; set; }
    }
}
