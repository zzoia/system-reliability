using System.Collections.Generic;

namespace ReliabilityModel.Model
{
    public class PossibleTransitions
    {
        public PossibleTransitions(SystemState systemState)
        {
            SystemState = systemState;
            ToSystemStates = new List<SystemStateTransition>();
        }

        public SystemState SystemState { get; }

        public IList<SystemStateTransition> ToSystemStates { get; }
    }
}