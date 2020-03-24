using System.Collections.Generic;

namespace ReliabilityModel.Model
{
    public class PossibleTransitions
    {
        public PossibleTransitions(SystemState systemState)
        {
            SystemState = systemState;
            ToSystemStates = new List<SystemState>();
        }

        public SystemState SystemState { get; }

        public IList<SystemState> ToSystemStates { get; }
    }
}