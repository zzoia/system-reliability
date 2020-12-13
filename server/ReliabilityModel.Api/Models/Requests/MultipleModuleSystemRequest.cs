using System.Collections.Generic;
using System.Linq;
using ReliabilityModel.Model;
using ReliabilityModel.Model.System;

namespace ReliabilityModel.Api.Models.Requests
{
    public class MultipleModuleSystemRequest : SystemRequest
    {
        public ReliabilityDependency Dependency { get; set; }

        public IEnumerable<SystemRequest> Members { get; set; }

        public override Model.System.System ToSystem()
        {
            var subSystems = Members.Select(member => member.ToSystem()).ToList();
            return new MultipleModuleSystem(subSystems, Dependency);
        }
    }
}