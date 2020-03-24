using System.Collections.Generic;

namespace ReliabilityModel.Model.Responses
{
    public class SystemStateModel
    {
        public bool IsTerminal { get; set; }

        public bool IsWaitingRecovery { get; set; }

        public bool IsWorking { get; set; }

        public IEnumerable<ModuleStateModel> ModuleStates { get; set; }
    }
}
