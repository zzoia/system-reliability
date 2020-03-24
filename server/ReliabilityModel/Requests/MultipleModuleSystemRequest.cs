using System.Collections.Generic;

namespace ReliabilityModel.Model.Requests
{
    public class MultipleModuleSystemRequest : SystemRequest
    {
        public IEnumerable<SystemRequest> Members { get; set; }
    }
}