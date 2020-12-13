using System;
using System.Collections.Generic;
using System.Linq;

namespace ReliabilityModel.Model.System
{
    public class MultipleModuleSystem : System
    {
        public MultipleModuleSystem(IReadOnlyList<System> subSystems, ReliabilityDependency dependency)
        {
            SubSystems = subSystems;
            Dependency = dependency;

            foreach (System subSystem in SubSystems)
            {
                subSystem.Parent = this;
            }
        }

        public ReliabilityDependency Dependency { get; }

        public IReadOnlyList<System> SubSystems { get; }

        public override bool IsStateTerminal(SystemState systemState)
        {
            foreach (System subSystem in SubSystems)
            {
                if (subSystem.IsStateTerminal(systemState))
                {
                    if (Dependency == ReliabilityDependency.And)
                    {
                        return true;
                    }
                }
                else
                {
                    if (Dependency == ReliabilityDependency.Or)
                    {
                        return false;
                    }
                }
            }

            return Dependency == ReliabilityDependency.Or;
        }

        public override bool WaitingRecovery(SystemState systemState)
        {
            switch (Dependency)
            {
                case ReliabilityDependency.And:
                    {
                        var waitingRecoveryFound = false;
                        foreach (System subSystem in SubSystems)
                        {
                            if (subSystem.IsStateTerminal(systemState))
                            {
                                return false;
                            }

                            if (subSystem.WaitingRecovery(systemState))
                            {
                                waitingRecoveryFound = true;
                            }
                        }

                        return waitingRecoveryFound;
                    }
                case ReliabilityDependency.Or:
                    {
                        var waitingRecoveryFound = false;
                        foreach (System subSystem in SubSystems)
                        {
                            if (subSystem.WaitingRecovery(systemState))
                            {
                                waitingRecoveryFound = true;
                            }

                            if (subSystem.IsWorking(systemState))
                            {
                                return false;
                            }
                        }

                        return waitingRecoveryFound;
                    }
                default:
                    throw new ArgumentOutOfRangeException();
            }
        }

        public override bool IsWorking(SystemState systemState)
        {
            switch (Dependency)
            {
                case ReliabilityDependency.And:
                    return SubSystems.All(system => system.IsWorking(systemState));

                case ReliabilityDependency.Or:
                    return SubSystems.Any(system => system.IsWorking(systemState));

                default:
                    throw new ArgumentOutOfRangeException();
            }
        }
    }
}