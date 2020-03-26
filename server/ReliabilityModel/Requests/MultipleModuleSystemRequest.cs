using ReliabilityModel.Model.System;
using System.Collections.Generic;
using System.Linq;

namespace ReliabilityModel.Model.Requests
{
    public class MultipleModuleSystemRequest : SystemRequest
    {
        public ReliabilityDependency Dependency { get; set; }

        public IEnumerable<SystemRequest> Members { get; set; }

        public override System.System ToSystem()
        {
            var subSystems = Members.Select(member => member.ToSystem()).ToList();
            return new MultipleModuleSystem(subSystems, Dependency);
        }
    }
}