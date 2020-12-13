using System.Collections.Generic;
using System.Linq;
using ReliabilityModel.Model.Enums;
using ReliabilityModel.Model.System;

namespace ReliabilityModel.Api.Models.Requests
{
    public class MultipleModuleSystemRequest : SystemRequest
    {
        public ReliabilityDependency Dependency { get; set; }

        public IEnumerable<SystemRequest> Members { get; set; }

        public override Model.System.System ToSystem()
        {
            IReadOnlyList<Model.System.System> subSystems = Members.Select(member => member.ToSystem()).ToList();
            return new MultipleModuleSystem(subSystems, Dependency);
        }
    }
}