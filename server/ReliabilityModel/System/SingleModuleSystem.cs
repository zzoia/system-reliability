﻿using System.Collections.Generic;
using System.Linq;

namespace ReliabilityModel.Model.System
{
    public class SingleModuleSystem : System
    {
        private readonly int? _recoveryNumber;

        public SingleModuleSystem(string name, int? recoveryNumber)
        {
            _recoveryNumber = recoveryNumber;
            Name = name;
        }

        public double FailureRate { get; set; }

        public double RecoveryRate { get; set; }

        public string Name { get; }

        public IReadOnlyList<ModuleState> GetPossibleNextStates()
        {
            var possibleModuleStates = new List<ModuleState>();
            if (_recoveryNumber.HasValue)
            {
                for (var index = 0; index < _recoveryNumber.Value; index++)
                {
                    var recoveriesLeft = _recoveryNumber.Value - index;
                    possibleModuleStates.Add(new ModuleState(this, true, recoveriesLeft));
                    possibleModuleStates.Add(new ModuleState(this, false, recoveriesLeft));
                }

                possibleModuleStates.Add(new ModuleState(this, true, 0));
                possibleModuleStates.Add(new ModuleState(this, false, 0));
            }
            else
            {
                possibleModuleStates.Add(new ModuleState(this, true, null));
                possibleModuleStates.Add(new ModuleState(this, false, null));
            }

            return possibleModuleStates;
        }

        public override bool IsStateTerminal(SystemState systemState)
        {
            var state = systemState.ModuleStates
                .Single(moduleState => moduleState.Module == this);

            return state.IsTerminal;
        }

        public override bool WaitingRecovery(SystemState systemState)
        {
            var state = systemState.ModuleStates
                .Single(moduleState => moduleState.Module == this);

            return state.WaitingRecovery;
        }

        public override bool IsWorking(SystemState systemState)
        {
            var state = systemState.ModuleStates
                .Single(moduleState => moduleState.Module == this);

            return state.IsWorking;
        }

        public override IReadOnlyCollection<SingleModuleSystem> Flatten() => new List<SingleModuleSystem>
        {
            this
        };
    }
}